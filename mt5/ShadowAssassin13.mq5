//+------------------------------------------------------------------+
//|                                            ShadowAssassin13.mq5  |
//|        "Shadow Assassin" - Gold (XAUUSD) Trend-Surfing Net EA    |
//|                                                                   |
//|  Evolution of AMReturns v2. Same philosophy (fixed lots, NO      |
//|  martingale, hard cap, every module toggle-able) but rebuilt     |
//|  around one idea: stay flat and invisible until gates + votes    |
//|  agree that gold is truly trending, then strike with a CIRCLE    |
//|  OF 13 ORDERS in the trend direction only and ride the wave.     |
//|                                                                   |
//|  PIPELINE (each stage must pass):                                |
//|   1. GATES      spread / session / rollover / ATR band /         |
//|                 efficiency ratio / tick-flow / margin / cooldown |
//|   2. APPROVALS  vote score from 6 independent detectors:        |
//|                 tick velocity, ROC acceleration, live channel    |
//|                 breakout, EMA stack, ADX+DI, RSI regime.         |
//|                 Need >= MinVotes for one side and <= MaxOpposing |
//|                 votes for the other.                              |
//|   3. STRIKE     fill the circle (max 13 positions+pendings):     |
//|                 MARKET slots   - instant entry                   |
//|                 STOP slots     - breakout ladder ahead of price  |
//|                 LIMIT slots    - pullback reload behind price    |
//|                 All ATR-spaced, single direction, fixed lot.     |
//|   4. BANK       per-position BE + chandelier ATR trail,          |
//|                 time-stop, basket ratchet (peak give-back),      |
//|                 hard basket target / basket stop, opposite-      |
//|                 consensus flatten, equity/daily/DD halts.        |
//|                                                                   |
//|  NOTE: Hedging account recommended. On NETTING accounts positions|
//|  of one direction merge; the EA still works (single direction)   |
//|  but per-slot SL/TP become shared.                               |
//|  Inputs expressed in POINTS assume gold quoted with 2 digits     |
//|  (1 point = 0.01). Most sizing is ATR-based and broker-agnostic. |
//|  ALWAYS backtest on real ticks + forward test on demo first.     |
//+------------------------------------------------------------------+
#property copyright "Shadow Assassin"
#property version   "1.00"
#property strict

#include <Trade\Trade.mqh>

CTrade trade;

#define MAX_CIRCLE 13
#define TICK_BUF   128

//====================================================================
// INPUTS
//====================================================================
input group "=== General ==="
input string InpComment            = "SA13";
input long   InpMagic              = 131313;
input int    InpDeviation          = 20;

input group "=== Module Toggles ==="
input bool   InpUseGates           = true;    // master switch for ALL entry gates
input bool   InpUseVoteApproval    = true;    // false = any single detector may fire
input bool   InpUseMarketSlots     = true;    // circle option A: instant market entry
input bool   InpUseStopSlots       = true;    // circle option B: breakout stop ladder
input bool   InpUseLimitSlots      = true;    // circle option C: pullback limit reload
input bool   InpUseBreakEven       = true;
input bool   InpUseATRTrail        = true;
input bool   InpUseTimeStop        = true;
input bool   InpUseBasketRatchet   = true;
input bool   InpUseBasketHardTP    = true;
input bool   InpUseBasketStop      = true;
input bool   InpUseOppositeFlatten = true;    // flatten when opposite consensus appears
input bool   InpUseDailyLossLimit  = true;
input bool   InpUseDrawdownLimit   = true;
input bool   InpShowPanel          = true;

input group "=== MINIMAL TICK MODE (trade on ticks with minimum requirements) ==="
input bool   InpTickScalpMode      = true;    // ON = only spread+margin gates, 1 tick vote is enough, quick profit bank
input int    InpScalpMaxSpread     = 80;      // spread gate used in this mode (points)
input int    InpScalpWindowMs      = 1000;    // tick window in this mode
input double InpScalpTickPoints    = 8;       // net tick move (points) that fires a strike
input double InpScalpConsistency   = 0.50;    // share of ticks agreeing with the move
input double InpScalpMinATRPts     = 100;     // ATR floor so ladder spacing always clears the spread
input double InpQuickBankUSD       = 0.60;    // SWALLOW: close each position the moment it shows this $ profit (0 = off)
input double InpQuickBankPoints    = 0;       // or this many points of profit (0 = off)
input bool   InpRestrikeInstantly  = true;    // no cooldown after a bank - re-strike on the next tick

input group "=== BIG CHART EYE (higher-timeframe bias + runner positions) ==="
input bool   InpUseHTFBias         = true;    // read H1/H4/D1 trend before every strike
input ENUM_TIMEFRAMES InpHTF1      = PERIOD_H1;
input ENUM_TIMEFRAMES InpHTF2      = PERIOD_H4;
input ENUM_TIMEFRAMES InpHTF3      = PERIOD_D1;
input int    InpHTFEmaFast         = 50;      // per-TF trend = price > EMA fast > EMA slow (or inverse)
input int    InpHTFEmaSlow         = 200;
input int    InpHTFMinTFs          = 2;       // how many of the 3 TFs must agree
input bool   InpHTFBlockCounter    = true;    // skip scalps against a clear big-chart trend
input bool   InpUseRunners         = true;    // open "big prize" runner positions on aligned setups
input int    InpRunnerSlots        = 3;       // slots of the 13 reserved for runners
input double InpRunnerLotMult      = 1.0;     // runner lot multiplier (fixed, not loss-driven)
input int    InpRunnerBreakBars    = 24;      // H1 channel lookback for runner breakout trigger
input double InpRunnerPullbackATR  = 0.6;     // or: price within this many H1-ATR of H1 EMA21 while trend resumes
input int    InpRunnerGapMinutes   = 20;      // min minutes between runner entries
input double InpRunnerSL_ATR       = 1.2;     // runner SL in H1 ATR
input double InpRunnerTP_ATR       = 5.0;     // runner TP in H1 ATR (0 = trail only)
input double InpRunnerBE_ATR       = 1.0;     // runner break-even trigger (H1 ATR)
input double InpRunnerTrailStart   = 1.6;     // runner trail start (H1 ATR)
input double InpRunnerTrailDist    = 1.0;     // runner trail distance (H1 ATR)
input int    InpRunnerMaxHours     = 48;      // close a runner not in profit after this long

input group "=== SPIDER NET (David Star: bidirectional net centred on price) ==="
input bool   InpSpiderMode         = true;    // ON = symmetric net replaces the one-direction ladder
input int    InpSpiderRings        = 3;       // rings of 4 orders (auto-clamped to the free circle slots)
input double InpSpiderStepATR      = 0.50;    // step S between levels, in ATR (floored by broker min distance)
input bool   InpSpiderSymmetric    = true;    // false = trend-weighted: only with-trend orders + the reverse stop
input bool   InpSLAsReverse        = true;    // no tight SL: the opposite stop order IS the stop-and-reverse
input double InpSpiderCatSL_ATR    = 3.0;     // catastrophe SL only (0 = none) - hard backstop behind the reverse stop
input double InpSpiderTP_S         = 1.0;     // each cell's TP, in steps S
input double InpSpiderCellUSD      = 1.50;    // winning cell banks at this $ profit (0 = off)
input double InpSpiderVaultUSD     = 10.0;    // whole-net profit: bank every cell and re-centre
input double InpSpiderRecenterS    = 1.0;     // re-centre the pending net when price drifts this many S from the anchor
input bool   InpSpiderCore         = true;    // use spare slot for a market "core" cell in the tick direction

input group "=== Circle of 13 (slot allocation, total capped at 13) ==="
input int    InpMarketSlots        = 1;       // instant-entry positions
input int    InpStopSlots          = 6;       // breakout stop ladder
input int    InpLimitSlots         = 6;       // pullback limit reload
input double InpStopFirstATR       = 0.25;    // first stop distance, in ATR
input double InpStopStepATR        = 0.35;    // stop ladder spacing, in ATR
input double InpLimitFirstATR      = 0.30;    // first limit distance, in ATR
input double InpLimitStepATR       = 0.40;    // limit ladder spacing, in ATR
input int    InpPendingExpirySec   = 900;     // pendings self-destruct after this
input int    InpDeployEverySec     = 3;       // min seconds between circle refills
input int    InpMarketGapSec       = 20;      // min seconds between market strikes

input group "=== Lot (FIXED per slot, never scaled up after a loss) ==="
input bool   InpUseRiskLot         = false;   // true = lot from risk % of balance per slot
input double InpFixedLot           = 0.01;
input double InpRiskPctPerSlot     = 0.15;    // % of balance risked per slot if risk lot on
input double InpMinMarginLevel     = 300.0;   // no new orders below this margin level %

input group "=== GATES ==="
input int    InpMaxSpreadPoints    = 45;      // skip if spread wider (points)
input int    InpSessionStartHour   = 7;       // server hour, inclusive
input int    InpSessionEndHour     = 21;      // server hour, exclusive
input int    InpBlockStartHour     = 23;      // rollover / thin-liquidity block start
input int    InpBlockEndHour       = 1;       // rollover block end (exclusive)
input int    InpERPeriod           = 10;      // Kaufman efficiency ratio (M1 bars)
input double InpMinER              = 0.30;
input double InpMinATRPoints       = 60;      // dead-market floor (points of ATR)
input double InpMaxATRPoints       = 1500;    // news-chaos ceiling (points of ATR)
input int    InpMinTicksPerWindow  = 4;       // tick-flow: need live ticks in window

input group "=== Indicators ==="
input ENUM_TIMEFRAMES InpATRTf     = PERIOD_M5;
input int    InpATRPeriod          = 14;
input ENUM_TIMEFRAMES InpTrendTf   = PERIOD_M5;
input int    InpEMAFast            = 21;
input int    InpEMASlow            = 55;
input int    InpADXPeriod          = 14;
input double InpMinADX             = 20.0;
input int    InpRSIPeriod          = 14;
input double InpRSIBull            = 55.0;
input double InpRSIBear            = 45.0;

input group "=== APPROVALS (vote detectors) ==="
input int    InpMinVotes           = 3;       // votes required on the winning side
input int    InpMaxOpposing        = 0;       // max votes tolerated on the other side
input int    InpTickWindowMs       = 1500;    // tick velocity window
input double InpTickMovePoints     = 25;      // net move inside window (points)
input double InpTickConsistency    = 0.60;    // share of ticks that must agree with the move
input int    InpROCPeriod          = 5;       // M1 bars per ROC reading
input int    InpROCLookback        = 3;       // consecutive accelerating readings
input double InpMinROC             = 0.02;    // min |ROC| % on latest reading
input ENUM_TIMEFRAMES InpBreakTf   = PERIOD_M5;
input int    InpBreakPeriod        = 20;      // channel lookback bars
input double InpBreakBufferATR     = 0.05;    // bid must clear channel by this ATR fraction

input group "=== Exits / Bank ==="
input double InpSL_ATR             = 1.6;     // initial SL distance in ATR
input double InpTP_ATR             = 3.0;     // initial TP distance in ATR (0 = none, trail only)
input double InpBE_TriggerATR      = 0.8;     // move SL to break-even after this profit (ATR)
input double InpBE_LockPoints      = 10;      // lock this many points above entry at BE
input double InpTrailStartATR      = 1.2;     // chandelier trail starts at this profit (ATR)
input double InpTrailDistATR       = 0.9;     // trail distance behind price (ATR)
input int    InpTimeStopMinutes    = 45;      // close positions older than this if not in profit
input double InpBasketRatchetStart = 6.0;     // $ basket profit at which ratchet arms
input double InpBasketGiveBackPct  = 30.0;    // close all if profit falls this % off the peak
input double InpBasketHardTP       = 40.0;    // $ basket profit: close all immediately
input double InpBasketMaxLoss      = 25.0;    // $ basket loss: close all + cooldown
input int    InpCooldownSec        = 30;      // pause after any basket close

input group "=== Account Safety ==="
input double InpMaxDailyLoss       = 100.0;
input double InpMaxDrawdownPct     = 15.0;

//====================================================================
// STATE
//====================================================================
double   g_tickPx[TICK_BUF];
long     g_tickMs[TICK_BUF];
int      g_tickHead = 0;      // next write index
int      g_tickN    = 0;

int      hATR = INVALID_HANDLE, hEMAf = INVALID_HANDLE, hEMAs = INVALID_HANDLE,
         hADX = INVALID_HANDLE, hRSI  = INVALID_HANDLE;

datetime g_lastBar       = 0;
double   g_atr = 0, g_er = 0;
int      g_rocSig = 0;
double   g_chanHigh = 0, g_chanLow = 0;
double   g_emaF = 0, g_emaS = 0, g_adx = 0, g_pdi = 0, g_mdi = 0, g_rsi = 50;

int      g_bullVotes = 0, g_bearVotes = 0;
int      g_dir = 0;           // approved direction: 1 / -1 / 0
string   g_gateMsg = "";

datetime g_cooldownUntil = 0, g_lastDeploy = 0, g_lastMarket = 0, g_day = 0;
int      hE50[3], hE200[3];
int      hE21H1 = INVALID_HANDLE, hATRH1 = INVALID_HANDLE;
double   g_e50[3], g_e200[3], g_atrH1 = 0, g_h1Hi = 0, g_h1Lo = 0, g_h1E21 = 0;
datetime g_lastRunner = 0;
double   g_anchor = 0;
double   g_dayStartBal = 0, g_peakEq = 0, g_basketPeak = 0;
bool     g_halted = false;
int      g_nMarket = 1, g_nStop = 6, g_nLimit = 6;

//====================================================================
// INIT / DEINIT
//====================================================================
int OnInit()
  {
   trade.SetExpertMagicNumber(InpMagic);
   trade.SetDeviationInPoints(InpDeviation);
   trade.SetTypeFillingBySymbol(_Symbol);
   trade.SetAsyncMode(false);

   // clamp circle to 13
   g_nMarket = InpUseMarketSlots ? MathMax(InpMarketSlots, 0) : 0;
   g_nStop   = InpUseStopSlots   ? MathMax(InpStopSlots,   0) : 0;
   g_nLimit  = InpUseLimitSlots  ? MathMax(InpLimitSlots,  0) : 0;
   while(g_nMarket + g_nStop + g_nLimit > MAX_CIRCLE)
     {
      if(g_nLimit > 0) g_nLimit--; else if(g_nStop > 0) g_nStop--; else g_nMarket--;
     }

   hATR  = iATR(_Symbol, InpATRTf, InpATRPeriod);
   hEMAf = iMA(_Symbol, InpTrendTf, InpEMAFast, 0, MODE_EMA, PRICE_CLOSE);
   hEMAs = iMA(_Symbol, InpTrendTf, InpEMASlow, 0, MODE_EMA, PRICE_CLOSE);
   hADX  = iADX(_Symbol, InpTrendTf, InpADXPeriod);
   hRSI  = iRSI(_Symbol, InpTrendTf, InpRSIPeriod, PRICE_CLOSE);
   if(hATR == INVALID_HANDLE || hEMAf == INVALID_HANDLE || hEMAs == INVALID_HANDLE ||
      hADX == INVALID_HANDLE || hRSI == INVALID_HANDLE)
     {
      Print("Indicator handle creation failed.");
      return(INIT_FAILED);
     }

   ENUM_TIMEFRAMES tfs[3];
   tfs[0] = InpHTF1; tfs[1] = InpHTF2; tfs[2] = InpHTF3;
   for(int i = 0; i < 3; i++)
     {
      hE50[i]  = iMA(_Symbol, tfs[i], InpHTFEmaFast, 0, MODE_EMA, PRICE_CLOSE);
      hE200[i] = iMA(_Symbol, tfs[i], InpHTFEmaSlow, 0, MODE_EMA, PRICE_CLOSE);
      g_e50[i] = 0; g_e200[i] = 0;
      if(hE50[i] == INVALID_HANDLE || hE200[i] == INVALID_HANDLE) { Print("HTF handle failed."); return(INIT_FAILED); }
     }
   hE21H1 = iMA(_Symbol, InpHTF1, 21, 0, MODE_EMA, PRICE_CLOSE);
   hATRH1 = iATR(_Symbol, InpHTF1, 14);
   if(hE21H1 == INVALID_HANDLE || hATRH1 == INVALID_HANDLE) return(INIT_FAILED);

   g_dayStartBal = AccountInfoDouble(ACCOUNT_BALANCE);
   g_peakEq      = AccountInfoDouble(ACCOUNT_EQUITY);
   g_day         = DayStart(TimeCurrent());

   PrintFormat("ShadowAssassin13 ready. Circle = %d market + %d stop + %d limit = %d",
               g_nMarket, g_nStop, g_nLimit, g_nMarket + g_nStop + g_nLimit);
   if((ENUM_ACCOUNT_MARGIN_MODE)AccountInfoInteger(ACCOUNT_MARGIN_MODE) != ACCOUNT_MARGIN_MODE_RETAIL_HEDGING)
      Print("NOTE: netting account detected - same-direction positions will merge.");
   return(INIT_SUCCEEDED);
  }

void OnDeinit(const int reason)
  {
   IndicatorRelease(hATR); IndicatorRelease(hEMAf); IndicatorRelease(hEMAs);
   IndicatorRelease(hADX); IndicatorRelease(hRSI);
   for(int i = 0; i < 3; i++) { IndicatorRelease(hE50[i]); IndicatorRelease(hE200[i]); }
   IndicatorRelease(hE21H1); IndicatorRelease(hATRH1);
   Comment("");
  }

//====================================================================
// MAIN LOOP
//====================================================================
void OnTick()
  {
   DailyReset();
   PushTick();
   RefreshBarData();

   if(!RiskOK()) { Panel(); return; }

   ManageBasket();                 // bank / ratchet / stops on the whole net
   ManagePositions();              // BE, trail, time-stop per position

   if(InpTickScalpMode && InpRestrikeInstantly) g_cooldownUntil = 0;
   if(TimeCurrent() < g_cooldownUntil) { g_gateMsg = "cooldown"; Panel(); return; }

   EvaluateVotes();

   // opposite consensus => flatten the net, then wait
   if(InpUseOppositeFlatten && !InpTickScalpMode && !InpSpiderMode && g_dir != 0)
     {
      int held = HeldDirection();
      if(held != 0 && held == -g_dir)
        {
         FlattenAll("opposite consensus");
         g_cooldownUntil = TimeCurrent() + InpCooldownSec;
         Panel(); return;
        }
     }

   // spider net: bidirectional, replaces the single-direction strike below
   if(InpSpiderMode)
     {
      if(GatesPass())
        {
         if(g_dir != 0) TryRunner(g_dir);
         SpiderCycle();
        }
      Panel();
      return;
     }

   // pendings pointing the wrong way are removed as soon as direction is known
   if(g_dir != 0 && !InpTickScalpMode) DeletePendingsNotMatching(g_dir);

   if(g_dir == 0) { Panel(); return; }
   if(!GatesPass()) { Panel(); return; }

   // never mix directions: if a net is held the other way, do nothing
   int held = HeldDirection();
   if(held != 0 && held != g_dir) { Panel(); return; }

   // big-chart eye: runner strike first, then optionally block counter-trend scalps
   TryRunner(g_dir);
   if(InpUseHTFBias && InpHTFBlockCounter && HTFScore(-g_dir) >= InpHTFMinTFs)
     { g_gateMsg = "scalp blocked: big-chart trend opposes"; Panel(); return; }

   Strike(g_dir);
   Panel();
  }

//====================================================================
// HELPERS
//====================================================================
datetime DayStart(datetime t)
  {
   MqlDateTime d; TimeToStruct(t, d); d.hour = 0; d.min = 0; d.sec = 0;
   return(StructToTime(d));
  }

void DailyReset()
  {
   datetime today = DayStart(TimeCurrent());
   if(today != g_day)
     {
      g_day = today;
      g_dayStartBal = AccountInfoDouble(ACCOUNT_BALANCE);
      g_peakEq = AccountInfoDouble(ACCOUNT_EQUITY);
      g_halted = false;
     }
  }

double Pt() { return(SymbolInfoDouble(_Symbol, SYMBOL_POINT)); }
int    Dg() { return((int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS)); }
double Bid() { return(SymbolInfoDouble(_Symbol, SYMBOL_BID)); }
double Ask() { return(SymbolInfoDouble(_Symbol, SYMBOL_ASK)); }
double SpreadPts() { return((Ask() - Bid()) / Pt()); }

double BufVal(int handle, int buffer, int shift)
  {
   double b[1];
   if(CopyBuffer(handle, buffer, shift, 1, b) != 1) return(0.0);
   return(b[0]);
  }

// minimum legal distance from market for pendings / stops
double MinDist()
  {
   long sl = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   long fr = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_FREEZE_LEVEL);
   return((MathMax(sl, fr) + 2) * Pt() + (Ask() - Bid()));
  }

double NormLot(double lot)
  {
   double mn = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double mx = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   double st = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   if(st > 0) lot = MathFloor(lot / st + 1e-9) * st;
   return(MathMin(MathMax(lot, mn), mx));
  }

double SlotLot(double slDist)
  {
   if(!InpUseRiskLot || slDist <= 0) return(NormLot(InpFixedLot));
   double tv = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE);
   double ts = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   if(tv <= 0 || ts <= 0) return(NormLot(InpFixedLot));
   double lossPerLot = slDist / ts * tv;
   double risk = AccountInfoDouble(ACCOUNT_BALANCE) * InpRiskPctPerSlot / 100.0;
   return(NormLot(risk / lossPerLot));
  }

bool Mine(bool isPos)
  {
   if(isPos)
      return(PositionGetString(POSITION_SYMBOL) == _Symbol && PositionGetInteger(POSITION_MAGIC) == InpMagic);
   return(OrderGetString(ORDER_SYMBOL) == _Symbol && OrderGetInteger(ORDER_MAGIC) == InpMagic);
  }

int CountPositions(int dir = 0)
  {
   int n = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(PositionGetTicket(i) == 0 || !Mine(true)) continue;
      ENUM_POSITION_TYPE t = (ENUM_POSITION_TYPE)PositionGetInteger(POSITION_TYPE);
      if(dir == 0 || (dir > 0 && t == POSITION_TYPE_BUY) || (dir < 0 && t == POSITION_TYPE_SELL)) n++;
     }
   return(n);
  }

int CountPendings()
  {
   int n = 0;
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      if(OrderGetTicket(i) == 0 || !Mine(false)) continue;
      n++;
     }
   return(n);
  }

int HeldDirection()
  {
   int b = CountPositions(1), s = CountPositions(-1);
   if(b > 0 && s == 0) return(1);
   if(s > 0 && b == 0) return(-1);
   if(b > 0 && s > 0)  return(b >= s ? 1 : -1);
   return(0);
  }

double Floating(bool scalpOnly = false)
  {
   double t = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(PositionGetTicket(i) == 0 || !Mine(true)) continue;
      if(scalpOnly && IsRunner()) continue;
      t += PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
     }
   return(t);
  }

void CloseAllPositions(bool scalpOnly = false)
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong tk = PositionGetTicket(i);
      if(tk == 0 || !Mine(true)) continue;
      if(scalpOnly && IsRunner()) continue;
      trade.PositionClose(tk);
     }
  }

void DeleteAllPendings()
  {
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      ulong tk = OrderGetTicket(i);
      if(tk == 0 || !Mine(false)) continue;
      trade.OrderDelete(tk);
     }
  }

void FlattenAll(string why, bool scalpOnly = false)
  {
   PrintFormat("FLATTEN%s: %s (floating $%.2f)", scalpOnly ? "(scalp)" : "", why, Floating(scalpOnly));
   CloseAllPositions(scalpOnly);
   DeleteAllPendings();
   g_basketPeak = 0;
  }

void DeletePendingsNotMatching(int dir)
  {
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      ulong tk = OrderGetTicket(i);
      if(tk == 0 || !Mine(false)) continue;
      ENUM_ORDER_TYPE t = (ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE);
      bool isBuy = (t == ORDER_TYPE_BUY_STOP || t == ORDER_TYPE_BUY_LIMIT);
      if((dir > 0) != isBuy) trade.OrderDelete(tk);
     }
  }

//====================================================================
// TICK FLOW (ring buffer with millisecond stamps)
//====================================================================
void PushTick()
  {
   MqlTick tk;
   if(!SymbolInfoTick(_Symbol, tk)) return;
   g_tickPx[g_tickHead] = (tk.bid + tk.ask) * 0.5;
   g_tickMs[g_tickHead] = tk.time_msc;
   g_tickHead = (g_tickHead + 1) % TICK_BUF;
   if(g_tickN < TICK_BUF) g_tickN++;
  }

// fills net move (points), tick count, and up/down agreement inside the window
void TickFlow(double &movePts, int &count, double &agree)
  {
   movePts = 0; count = 0; agree = 0;
   if(g_tickN < 2) return;
   int newest = (g_tickHead - 1 + TICK_BUF) % TICK_BUF;
   long tNew = g_tickMs[newest];
   int ups = 0, downs = 0;
   int oldest = newest;
   for(int k = 1; k < g_tickN; k++)
     {
      int idx = (newest - k + TICK_BUF) % TICK_BUF;
      if(tNew - g_tickMs[idx] > (InpTickScalpMode ? InpScalpWindowMs : InpTickWindowMs)) break;
      int nxt = (idx + 1) % TICK_BUF;
      if(g_tickPx[nxt] > g_tickPx[idx]) ups++;
      else if(g_tickPx[nxt] < g_tickPx[idx]) downs++;
      oldest = idx;
      count++;
     }
   count++;
   movePts = (g_tickPx[newest] - g_tickPx[oldest]) / Pt();
   int moves = ups + downs;
   if(moves > 0)
      agree = (double)(movePts >= 0 ? ups : downs) / moves;
  }

//====================================================================
// BIG CHART EYE
//====================================================================
void RefreshHTF()
  {
   for(int i = 0; i < 3; i++)
     {
      g_e50[i]  = BufVal(hE50[i], 0, 1);
      g_e200[i] = BufVal(hE200[i], 0, 1);
     }
   g_atrH1  = BufVal(hATRH1, 0, 1);
   g_h1E21  = BufVal(hE21H1, 0, 1);
   double h[], l[];
   int n = MathMax(InpRunnerBreakBars, 5);
   if(CopyHigh(_Symbol, InpHTF1, 1, n, h) == n && CopyLow(_Symbol, InpHTF1, 1, n, l) == n)
     {
      g_h1Hi = h[ArrayMaximum(h)];
      g_h1Lo = l[ArrayMinimum(l)];
     }
  }

// number of big-chart TFs whose trend points in direction dir (price > EMA fast > EMA slow)
int HTFScore(int dir)
  {
   if(!InpUseHTFBias || dir == 0) return(0);
   double px = Bid();
   int n = 0;
   for(int i = 0; i < 3; i++)
     {
      if(g_e50[i] <= 0 || g_e200[i] <= 0) continue;
      if(dir > 0 && px > g_e50[i] && g_e50[i] > g_e200[i]) n++;
      if(dir < 0 && px < g_e50[i] && g_e50[i] < g_e200[i]) n++;
     }
   return(n);
  }

bool IsRunner() { return(StringFind(PositionGetString(POSITION_COMMENT), "_R") >= 0); }

int CountRunners()
  {
   int n = 0;
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(PositionGetTicket(i) == 0 || !Mine(true)) continue;
      if(IsRunner()) n++;
     }
   return(n);
  }

// Big prize entry: HTF aligned AND (H1 channel breakout OR pullback to H1 EMA21 with tick trigger in trend direction)
void TryRunner(int dir)
  {
   if(!InpUseRunners || !InpUseHTFBias || InpRunnerSlots <= 0 || g_atrH1 <= 0) return;
   if(HTFScore(dir) < InpHTFMinTFs) return;
   if(CountRunners() >= InpRunnerSlots) return;
   if(TimeCurrent() - g_lastRunner < InpRunnerGapMinutes * 60) return;
   if(CountPositions() + CountPendings() >= MAX_CIRCLE) return;

   double bid = Bid(), ask = Ask();
   bool breakout = (dir > 0) ? (bid > g_h1Hi) : (bid < g_h1Lo);
   double dist = MathAbs(bid - g_h1E21);
   bool pullback = (dist <= InpRunnerPullbackATR * g_atrH1) &&
                   ((dir > 0 && bid >= g_h1E21) || (dir < 0 && bid <= g_h1E21));
   if(!breakout && !pullback) return;

   bool isBuy = (dir > 0);
   double ref = isBuy ? ask : bid;
   double sd  = MathMax(g_atrH1 * InpRunnerSL_ATR, MinDist());
   double sl  = NormalizeDouble(isBuy ? ref - sd : ref + sd, Dg());
   double tp  = 0;
   if(InpRunnerTP_ATR > 0)
     {
      double td = MathMax(g_atrH1 * InpRunnerTP_ATR, MinDist());
      tp = NormalizeDouble(isBuy ? ref + td : ref - td, Dg());
     }
   double lot = NormLot(SlotLot(sd) * InpRunnerLotMult);
   bool ok = isBuy ? trade.Buy(lot, _Symbol, ask, sl, tp, InpComment + "_R")
                   : trade.Sell(lot, _Symbol, bid, sl, tp, InpComment + "_R");
   if(ok)
     {
      g_lastRunner = TimeCurrent();
      PrintFormat("RUNNER %s lot %.2f (%s) HTF=%d/3", isBuy ? "BUY" : "SELL", lot,
                  breakout ? "H1 breakout" : "H1 pullback", HTFScore(dir));
     }
  }

//====================================================================
// BAR-CACHED DATA (refreshed once per new M1 bar)
//====================================================================
double Efficiency(int period)
  {
   double c[];
   ArraySetAsSeries(c, true);
   if(CopyClose(_Symbol, PERIOD_M1, 1, period + 1, c) < period + 1) return(0.0);
   double net = MathAbs(c[0] - c[period]), sum = 0;
   for(int i = 0; i < period; i++) sum += MathAbs(c[i] - c[i + 1]);
   return(sum > 0 ? MathMin(1.0, net / sum) : 0.0);
  }

double ROCAt(const double &c[], int shift, int period)
  {
   double past = c[shift + period];
   return(past == 0 ? 0.0 : (c[shift] - past) / past * 100.0);
  }

int ROCAcceleration()
  {
   int n = MathMax(InpROCLookback, 2);
   int need = n + InpROCPeriod + 1;
   double c[];
   ArraySetAsSeries(c, true);
   if(CopyClose(_Symbol, PERIOD_M1, 0, need + 1, c) < need + 1) return(0);
   double r[];
   ArrayResize(r, n);
   for(int i = 0; i < n; i++) r[i] = ROCAt(c, i + 1, InpROCPeriod);
   bool pos = true, neg = true;
   for(int i = 0; i < n; i++) { if(r[i] <= 0) pos = false; if(r[i] >= 0) neg = false; }
   for(int i = 0; i < n - 1; i++)
      if(MathAbs(r[i]) <= MathAbs(r[i + 1])) return(0);
   if(MathAbs(r[0]) < InpMinROC) return(0);
   return(pos ? 1 : (neg ? -1 : 0));
  }

void RefreshBarData()
  {
   datetime t[1];
   if(CopyTime(_Symbol, PERIOD_M1, 0, 1, t) != 1) return;
   if(t[0] == g_lastBar && g_atr > 0) return;
   g_lastBar = t[0];

   g_atr  = BufVal(hATR, 0, 1);
   g_emaF = BufVal(hEMAf, 0, 1);
   g_emaS = BufVal(hEMAs, 0, 1);
   g_adx  = BufVal(hADX, 0, 1);
   g_pdi  = BufVal(hADX, 1, 1);
   g_mdi  = BufVal(hADX, 2, 1);
   g_rsi  = BufVal(hRSI, 0, 1);
   if(InpTickScalpMode)
      g_atr = MathMax(g_atr, InpScalpMinATRPts * Pt());
   g_er   = Efficiency(InpERPeriod);
   g_rocSig = ROCAcceleration();
   RefreshHTF();

   double h[], l[];
   if(CopyHigh(_Symbol, InpBreakTf, 1, InpBreakPeriod, h) == InpBreakPeriod &&
      CopyLow(_Symbol, InpBreakTf, 1, InpBreakPeriod, l) == InpBreakPeriod)
     {
      g_chanHigh = h[ArrayMaximum(h)];
      g_chanLow  = l[ArrayMinimum(l)];
     }
  }

//====================================================================
// APPROVALS: VOTES
//====================================================================
void EvaluateVotes()
  {
   int bull = 0, bear = 0;
   double bid = Bid();

   // 1) tick velocity + consistency
   double mv; int cnt; double ag;
   TickFlow(mv, cnt, ag);
   double needMove = InpTickScalpMode ? InpScalpTickPoints : InpTickMovePoints;
   double needAg   = InpTickScalpMode ? InpScalpConsistency : InpTickConsistency;
   if(cnt >= 2 && ag >= needAg)
     {
      if(mv >= needMove) bull++;
      else if(mv <= -needMove) bear++;
     }

   // 2) ROC acceleration
   if(g_rocSig > 0) bull++; else if(g_rocSig < 0) bear++;

   // 3) live channel breakout
   double buf = InpBreakBufferATR * g_atr;
   if(g_chanHigh > 0)
     {
      if(bid > g_chanHigh + buf) bull++;
      else if(bid < g_chanLow - buf) bear++;
     }

   // 4) EMA stack
   if(g_emaF > 0 && g_emaS > 0)
     {
      if(bid > g_emaF && g_emaF > g_emaS) bull++;
      else if(bid < g_emaF && g_emaF < g_emaS) bear++;
     }

   // 5) ADX strength + DI direction
   if(g_adx >= InpMinADX)
     {
      if(g_pdi > g_mdi) bull++; else if(g_mdi > g_pdi) bear++;
     }

   // 6) RSI regime (momentum, not reversion)
   if(g_rsi >= InpRSIBull) bull++; else if(g_rsi <= InpRSIBear) bear++;

   g_bullVotes = bull; g_bearVotes = bear;

   int need = (InpUseVoteApproval && !InpTickScalpMode) ? InpMinVotes : 1;
   int opp  = (InpUseVoteApproval && !InpTickScalpMode) ? InpMaxOpposing : (InpTickScalpMode ? 0 : 6);
   g_dir = 0;
   if(bull >= need && bear <= opp && bull > bear) g_dir = 1;
   else if(bear >= need && bull <= opp && bear > bull) g_dir = -1;
  }

//====================================================================
// GATES
//====================================================================
bool GatesPass()
  {
   if(!InpUseGates) { g_gateMsg = "gates off"; return(true); }

   if(InpTickScalpMode)   // minimum requirements: sane spread + margin only
     {
      if(SpreadPts() > InpScalpMaxSpread) { g_gateMsg = StringFormat("spread %.0f", SpreadPts()); return(false); }
      double ml0 = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
      if(ml0 > 0 && ml0 < InpMinMarginLevel) { g_gateMsg = "margin level low"; return(false); }
      g_gateMsg = "scalp gates open";
      return(true);
     }

   if(g_atr <= 0)                      { g_gateMsg = "no ATR yet"; return(false); }
   double atrPts = g_atr / Pt();
   if(SpreadPts() > InpMaxSpreadPoints){ g_gateMsg = StringFormat("spread %.0f", SpreadPts()); return(false); }

   MqlDateTime d; TimeToStruct(TimeCurrent(), d);
   if(InpSessionStartHour != InpSessionEndHour &&
      (d.hour < InpSessionStartHour || d.hour >= InpSessionEndHour))
                                       { g_gateMsg = "outside session"; return(false); }
   bool blocked = (InpBlockStartHour <= InpBlockEndHour)
                  ? (d.hour >= InpBlockStartHour && d.hour < InpBlockEndHour)
                  : (d.hour >= InpBlockStartHour || d.hour < InpBlockEndHour);
   if(InpBlockStartHour != InpBlockEndHour && blocked)
                                       { g_gateMsg = "rollover block"; return(false); }

   if(atrPts < InpMinATRPoints)        { g_gateMsg = StringFormat("ATR too low %.0f", atrPts); return(false); }
   if(atrPts > InpMaxATRPoints)        { g_gateMsg = StringFormat("ATR too high %.0f", atrPts); return(false); }
   if(g_er < InpMinER)                 { g_gateMsg = StringFormat("noise ER %.2f", g_er); return(false); }

   double mv; int cnt; double ag;
   TickFlow(mv, cnt, ag);
   if(cnt < InpMinTicksPerWindow)      { g_gateMsg = "tick flow thin"; return(false); }

   double ml = AccountInfoDouble(ACCOUNT_MARGIN_LEVEL);
   if(ml > 0 && ml < InpMinMarginLevel){ g_gateMsg = "margin level low"; return(false); }

   g_gateMsg = "all gates open";
   return(true);
  }

//====================================================================
// RISK HALTS
//====================================================================
bool RiskOK()
  {
   if(g_halted) { g_gateMsg = "halted for the day"; return(false); }
   double eq = AccountInfoDouble(ACCOUNT_EQUITY);
   if(eq > g_peakEq) g_peakEq = eq;

   if(InpUseDailyLossLimit && eq - g_dayStartBal <= -MathAbs(InpMaxDailyLoss))
     { FlattenAll("daily loss limit"); g_halted = true; return(false); }
   if(InpUseDrawdownLimit && g_peakEq > 0 &&
      (g_peakEq - eq) / g_peakEq * 100.0 >= MathAbs(InpMaxDrawdownPct))
     { FlattenAll("drawdown limit"); g_halted = true; return(false); }
   return(true);
  }

//====================================================================
// STRIKE: fill the circle in the approved direction
//====================================================================
bool OrderNear(ENUM_ORDER_TYPE type, double price, double tol)
  {
   for(int i = OrdersTotal() - 1; i >= 0; i--)
     {
      if(OrderGetTicket(i) == 0 || !Mine(false)) continue;
      if((ENUM_ORDER_TYPE)OrderGetInteger(ORDER_TYPE) != type) continue;
      if(MathAbs(OrderGetDouble(ORDER_PRICE_OPEN) - price) <= tol) return(true);
     }
   return(false);
  }

void SLTP(double ref, bool isBuy, double &sl, double &tp)
  {
   double sd = MathMax(g_atr * InpSL_ATR, MinDist());
   sl = NormalizeDouble(isBuy ? ref - sd : ref + sd, Dg());
   if(InpTP_ATR > 0)
     {
      double td = MathMax(g_atr * InpTP_ATR, MinDist());
      tp = NormalizeDouble(isBuy ? ref + td : ref - td, Dg());
     }
   else tp = 0;
  }

//====================================================================
// SPIDER NET - per ring j (S = step):
//   SELL LIMIT @ anchor + (1.5+j)S   BUY STOP  @ anchor + (0.5+j)S
//   ---------------------- anchor ----------------------
//   SELL STOP  @ anchor - (0.5+j)S   BUY LIMIT @ anchor - (1.5+j)S
// A filled BUY STOP is protected by the SELL STOP below it (and vice
// versa): the opposite stop order is the stop-and-reverse, so no tight
// SL is needed. The side that wins is banked per cell, and the net
// re-centres on the new price.
//====================================================================
bool PositionNear(bool isBuy, double px, double tol)
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      if(PositionGetTicket(i) == 0 || !Mine(true) || IsRunner()) continue;
      bool b = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY);
      if(b == isBuy && MathAbs(PositionGetDouble(POSITION_PRICE_OPEN) - px) <= tol) return(true);
     }
   return(false);
  }

void SpiderSLTP(double ref, bool isBuy, double S, double md, double &sl, double &tp)
  {
   sl = 0;
   if(InpSpiderCatSL_ATR > 0)
     {
      double sd = MathMax(g_atr * InpSpiderCatSL_ATR, md * 2.0);
      sl = NormalizeDouble(isBuy ? ref - sd : ref + sd, Dg());
     }
   else if(!InpSLAsReverse)
     {
      double t;
      SLTP(ref, isBuy, sl, t);
     }
   double td = MathMax(InpSpiderTP_S * S, md);
   tp = NormalizeDouble(isBuy ? ref + td : ref - td, Dg());
  }

bool PlaceSpider(ENUM_ORDER_TYPE ty, double px, double lot, double S, double md, datetime exp)
  {
   bool isBuy = (ty == ORDER_TYPE_BUY_STOP || ty == ORDER_TYPE_BUY_LIMIT);
   double sl, tp;
   SpiderSLTP(px, isBuy, S, md, sl, tp);
   string c = InpComment + "_SP";
   switch(ty)
     {
      case ORDER_TYPE_BUY_STOP:   return(trade.BuyStop(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, c));
      case ORDER_TYPE_SELL_LIMIT: return(trade.SellLimit(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, c));
      case ORDER_TYPE_SELL_STOP:  return(trade.SellStop(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, c));
      case ORDER_TYPE_BUY_LIMIT:  return(trade.BuyLimit(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, c));
     }
   return(false);
  }

void SpiderCycle()
  {
   if(g_atr <= 0) return;
   datetime now = TimeCurrent();
   if(now - g_lastDeploy < InpDeployEverySec) return;
   g_lastDeploy = now;

   double bid = Bid(), ask = Ask(), mid = (bid + ask) * 0.5;
   double md  = MinDist();
   double S   = MathMax(InpSpiderStepATR * g_atr, md * 2.0);

   // re-centre: the pending net follows price, open cells stay where they are
   if(g_anchor == 0 || MathAbs(mid - g_anchor) > InpSpiderRecenterS * S)
     {
      DeleteAllPendings();
      g_anchor = mid;
     }

   int runners = CountRunners();
   int reserve = (InpUseRunners && InpUseHTFBias) ? MathMax(0, InpRunnerSlots - runners) : 0;
   int slots   = MAX_CIRCLE - CountPositions() - CountPendings() - reserve;
   if(slots <= 0) return;

   double lot = SlotLot(MathMax(g_atr * MathMax(InpSpiderCatSL_ATR, 1.0), md));
   datetime exp = now + InpPendingExpirySec;
   double tol = S * 0.3;

   // core cell: market entry in the tick direction
   if(InpSpiderCore && g_dir != 0 && slots > 0 && now - g_lastMarket >= (InpTickScalpMode ? 1 : InpMarketGapSec) &&
      CountPositions(g_dir) - runners <= 0)
     {
      bool isBuy = (g_dir > 0);
      double ref = isBuy ? ask : bid, sl, tp;
      SpiderSLTP(ref, isBuy, S, md, sl, tp);
      bool ok = isBuy ? trade.Buy(lot, _Symbol, ask, sl, tp, InpComment + "_SPC")
                      : trade.Sell(lot, _Symbol, bid, sl, tp, InpComment + "_SPC");
      if(ok) { g_lastMarket = now; slots--; }
     }

   int rings = MathMax(1, MathMin(InpSpiderRings, 3));
   for(int j = 0; j < rings && slots > 0; j++)
     {
      double offStop = (0.5 + j) * S, offLim = (1.5 + j) * S;
      bool skipSellLimit = (!InpSpiderSymmetric && g_dir > 0);
      bool skipBuyLimit  = (!InpSpiderSymmetric && g_dir < 0);
      bool skipSellStop  = (!InpSpiderSymmetric && g_dir > 0 && j > 0);
      bool skipBuyStop   = (!InpSpiderSymmetric && g_dir < 0 && j > 0);

      double px;
      // SELL LIMIT (above)
      px = NormalizeDouble(g_anchor + offLim, Dg());
      if(slots > 0 && !skipSellLimit && px >= bid + md && !OrderNear(ORDER_TYPE_SELL_LIMIT, px, tol) && !PositionNear(false, px, tol))
         if(PlaceSpider(ORDER_TYPE_SELL_LIMIT, px, lot, S, md, exp)) slots--;
      // BUY STOP (above)
      px = NormalizeDouble(g_anchor + offStop, Dg());
      if(slots > 0 && !skipBuyStop && px >= ask + md && !OrderNear(ORDER_TYPE_BUY_STOP, px, tol) && !PositionNear(true, px, tol))
         if(PlaceSpider(ORDER_TYPE_BUY_STOP, px, lot, S, md, exp)) slots--;
      // SELL STOP (below)
      px = NormalizeDouble(g_anchor - offStop, Dg());
      if(slots > 0 && !skipSellStop && px <= bid - md && !OrderNear(ORDER_TYPE_SELL_STOP, px, tol) && !PositionNear(false, px, tol))
         if(PlaceSpider(ORDER_TYPE_SELL_STOP, px, lot, S, md, exp)) slots--;
      // BUY LIMIT (below)
      px = NormalizeDouble(g_anchor - offLim, Dg());
      if(slots > 0 && !skipBuyLimit && px <= ask - md && !OrderNear(ORDER_TYPE_BUY_LIMIT, px, tol) && !PositionNear(true, px, tol))
         if(PlaceSpider(ORDER_TYPE_BUY_LIMIT, px, lot, S, md, exp)) slots--;
     }
  }

void Strike(int dir)
  {
   if(g_atr <= 0) return;
   int used = CountPositions() + CountPendings();
   int runners = CountRunners();
   int reserve = (InpUseRunners && InpUseHTFBias) ? MathMax(0, InpRunnerSlots - runners) : 0;
   int slots = MAX_CIRCLE - used - reserve;
   if(slots <= 0) return;

   bool isBuy = (dir > 0);
   double ask = Ask(), bid = Bid();
   double slDist = MathMax(g_atr * InpSL_ATR, MinDist());
   double lot = SlotLot(slDist);
   double sl, tp;
   datetime now = TimeCurrent();

   // --- A) MARKET slot(s): instant strike, rate-limited
   int marketOpen = CountPositions(dir) - runners;
   if(g_nMarket > 0 && marketOpen < g_nMarket && now - g_lastMarket >= (InpTickScalpMode ? 1 : InpMarketGapSec) && slots > 0)
     {
      double ref = isBuy ? ask : bid;
      SLTP(ref, isBuy, sl, tp);
      bool ok = isBuy ? trade.Buy(lot, _Symbol, ask, sl, tp, InpComment + "_M")
                      : trade.Sell(lot, _Symbol, bid, sl, tp, InpComment + "_M");
      if(ok) { g_lastMarket = now; slots--; }
     }

   if(now - g_lastDeploy < InpDeployEverySec) return;
   g_lastDeploy = now;

   datetime exp = now + InpPendingExpirySec;
   double md = MinDist();

   // --- B) STOP ladder ahead of price (breakout continuation)
   for(int k = 0; k < g_nStop && slots > 0; k++)
     {
      double off = MathMax((InpStopFirstATR + k * InpStopStepATR) * g_atr, md);
      double px = NormalizeDouble(isBuy ? ask + off : bid - off, Dg());
      ENUM_ORDER_TYPE ty = isBuy ? ORDER_TYPE_BUY_STOP : ORDER_TYPE_SELL_STOP;
      if(OrderNear(ty, px, InpStopStepATR * g_atr * 0.5)) continue;
      SLTP(px, isBuy, sl, tp);
      bool ok = isBuy ? trade.BuyStop(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, InpComment + "_S")
                      : trade.SellStop(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, InpComment + "_S");
      if(ok) slots--;
     }

   // --- C) LIMIT ladder behind price (pullback reload inside the trend)
   for(int k = 0; k < g_nLimit && slots > 0; k++)
     {
      double off = MathMax((InpLimitFirstATR + k * InpLimitStepATR) * g_atr, md);
      double px = NormalizeDouble(isBuy ? bid - off : ask + off, Dg());
      ENUM_ORDER_TYPE ty = isBuy ? ORDER_TYPE_BUY_LIMIT : ORDER_TYPE_SELL_LIMIT;
      if(OrderNear(ty, px, InpLimitStepATR * g_atr * 0.5)) continue;
      SLTP(px, isBuy, sl, tp);
      bool ok = isBuy ? trade.BuyLimit(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, InpComment + "_L")
                      : trade.SellLimit(lot, px, _Symbol, sl, tp, ORDER_TIME_SPECIFIED, exp, InpComment + "_L");
      if(ok) slots--;
     }
  }

//====================================================================
// PER-POSITION BANK: break-even, chandelier trail, time-stop
//====================================================================
void ManagePositions()
  {
   if(g_atr <= 0) return;
   double pt = Pt();
   double md = MinDist();
   double bid = Bid(), ask = Ask();

   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong tk = PositionGetTicket(i);
      if(tk == 0 || !Mine(true)) continue;

      bool isBuy = (PositionGetInteger(POSITION_TYPE) == POSITION_TYPE_BUY);
      double open = PositionGetDouble(POSITION_PRICE_OPEN);
      double sl   = PositionGetDouble(POSITION_SL);
      double tp   = PositionGetDouble(POSITION_TP);
      double px   = isBuy ? bid : ask;
      double prof = isBuy ? px - open : open - px;
      double newSL = sl;
      bool   run = IsRunner();
      double a   = (run && g_atrH1 > 0) ? g_atrH1 : g_atr;
      double beT = run ? InpRunnerBE_ATR : InpBE_TriggerATR;
      double trS = run ? InpRunnerTrailStart : InpTrailStartATR;
      double trD = run ? InpRunnerTrailDist : InpTrailDistATR;

      // SWALLOW: bank the profit the instant it appears
      double bankUSD = InpSpiderMode ? InpSpiderCellUSD : InpQuickBankUSD;
      if(!run && (InpTickScalpMode || InpSpiderMode || bankUSD > 0 || InpQuickBankPoints > 0))
        {
         double usd = PositionGetDouble(POSITION_PROFIT) + PositionGetDouble(POSITION_SWAP);
         if((bankUSD > 0 && usd >= bankUSD) ||
            (InpQuickBankPoints > 0 && prof >= InpQuickBankPoints * pt))
           { trade.PositionClose(tk); continue; }
        }

      // time-stop: stale and not in profit
      if(InpUseTimeStop)
        {
         long ageMin = (TimeCurrent() - (datetime)PositionGetInteger(POSITION_TIME)) / 60;
         long limitMin = run ? (long)InpRunnerMaxHours * 60 : InpTimeStopMinutes;
         if(ageMin >= limitMin && prof <= 0)
           { trade.PositionClose(tk); continue; }
        }

      if(InpUseBreakEven && prof >= beT * a)
        {
         double be = isBuy ? open + InpBE_LockPoints * pt : open - InpBE_LockPoints * pt;
         if(sl == 0 || (isBuy && be > newSL) || (!isBuy && be < newSL)) newSL = be;
        }

      if(InpUseATRTrail && prof >= trS * a)
        {
         double tr = isBuy ? px - trD * a : px + trD * a;
         if(newSL == 0 || (isBuy && tr > newSL) || (!isBuy && tr < newSL)) newSL = tr;
        }

      newSL = NormalizeDouble(newSL, Dg());
      if(newSL == sl || newSL == 0) continue;
      // respect broker distance and avoid spamming tiny modifications
      if(isBuy  && (newSL > bid - md || (sl != 0 && newSL - sl < 10 * pt))) continue;
      if(!isBuy && (newSL < ask + md || (sl != 0 && sl - newSL < 10 * pt))) continue;
      trade.PositionModify(tk, newSL, tp);
     }
  }

//====================================================================
// BASKET BANK: ratchet, hard TP, basket stop
//====================================================================
void ManageBasket()
  {
   if(CountPositions() - CountRunners() == 0) { g_basketPeak = 0; return; }
   double fp = Floating(true);
   if(fp > g_basketPeak) g_basketPeak = fp;

   if(InpUseBasketHardTP && fp >= (InpSpiderMode ? InpSpiderVaultUSD : InpBasketHardTP))
     { FlattenAll("basket hard target", true); g_anchor = 0; g_cooldownUntil = TimeCurrent() + InpCooldownSec; return; }

   if(InpUseBasketRatchet && g_basketPeak >= InpBasketRatchetStart &&
      fp <= g_basketPeak * (1.0 - InpBasketGiveBackPct / 100.0))
     { FlattenAll("basket ratchet give-back", true); g_cooldownUntil = TimeCurrent() + InpCooldownSec; return; }

   if(InpUseBasketStop && fp <= -MathAbs(InpBasketMaxLoss))
     { FlattenAll("basket stop", true); g_cooldownUntil = TimeCurrent() + InpCooldownSec * 4; return; }
  }

//====================================================================
// PANEL
//====================================================================
void Panel()
  {
   if(!InpShowPanel) return;
   string dirTxt = g_dir > 0 ? "BUY" : (g_dir < 0 ? "SELL" : "none");
   Comment(StringFormat(
      "=== SHADOW ASSASSIN 13 ===\n"
      "Bal $%.2f  Eq $%.2f  Float $%.2f (peak $%.2f)\n"
      "Circle: %d pos + %d pend / 13  [M%d S%d L%d]\n"
      "Votes  bull %d | bear %d  -> %s (need %d)\n"
      "ATR %.0f pts | ER %.2f | ADX %.1f | RSI %.1f | Spread %.0f\n"
      "HTF bull %d/3 | bear %d/3 | H1 ATR %.0f | Runners %d/%d\nSpider anchor %.2f | Mode: %s\nGate: %s\n",
      AccountInfoDouble(ACCOUNT_BALANCE), AccountInfoDouble(ACCOUNT_EQUITY), Floating(), g_basketPeak,
      CountPositions(), CountPendings(), g_nMarket, g_nStop, g_nLimit,
      g_bullVotes, g_bearVotes, dirTxt, InpMinVotes,
      g_atr / Pt(), g_er, g_adx, g_rsi, SpreadPts(),
      HTFScore(1), HTFScore(-1), g_atrH1 / Pt(), CountRunners(), InpRunnerSlots,
      g_anchor, InpSpiderMode ? "SPIDER NET" : "ladder",
      g_gateMsg));
  }
//+------------------------------------------------------------------+
