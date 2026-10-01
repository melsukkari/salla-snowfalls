jQuery(function($){
    // Auto-save interval notice when changed
    $('#asp_ping_interval').on('change', function(){
        var msg = $('<p class="description" style="color:#d63638;">⚠ Save settings to apply the new interval.</p>');
        $(this).next('.description').remove();
        $(this).after(msg);
    });
});
