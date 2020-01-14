// Hack to enable multiple modals by making sure the .modal-open class
// is set to the <body> when there is at least one modal open left
$('body').on('hidden.bs.modal', function () {
    if($('.modal.in').length > 0)
    {
        $('body').addClass('modal-open');
    }
});