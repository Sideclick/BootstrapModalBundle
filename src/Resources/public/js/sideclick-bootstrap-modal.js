/**
 * Created by rowan-reid on 2016/09/28.
 */
$(function() {

    // When our emptyModal is closed we remove it's content so that when it is filled
    // again then it will accept the new content, as per:
    // http://stackoverflow.com/questions/12286332/twitter-bootstrap-remote-modal-shows-same-content-everytime
    var $body = $('body');
    $body.on('hidden.bs.modal', '.modal', function () {
        $(this).removeData('bs.modal');

        // clear all the previously loaded content out from inside the modal dialog
        $('#emptyModal').find('.modal-dialog').empty();


    });

    // New click listener to set the path to the modal url
    // will first check to see if a hash url exit
    // if a hash does exist the append modal url to it else
    // set the hash url to the modal hash
    $body.on('click','a[data-sideclick-modal-trigger]', function (e) {
        e.preventDefault();
        var $modalUrl = $(e.currentTarget).attr('href');
        // if ($modalUrl.indexOf('#modal=')) {}
        if ($modalUrl.indexOf('#modal=') !== -1){
            $modalUrl = $modalUrl.substring(7, $modalUrl.length);
        }
        var modal = 'modal=' + $modalUrl;
        if (window.location.hash === '') {
            window.location.hash = modal;
        }else {
            var currentHash = window.location.hash.replace('#','');
            window.location.hash = currentHash + '&' + modal;
        }
    });

    // This function should be called after a form has been loaded into the #emptyModal with the 'data-async'
    // attribute (which indicates that the from should submit via Ajax)  It hooks into the submit event
    // on any forms within the modal and submits the form via ajax and deals with the response appropriately
    // NOTE that this function check to see if the form has any file inputs.  If it does then it will
    // not do anything
    bindModalAjaxForms = function() {

        $('#emptyModal[data-async] form').on('submit', function(event) {

            // grab the form
            var $form = $(this);

            // if the form has any file inputs
            if ($form.find(':file').length > 0) {

                // then jump out of this function because files cannot be posted via ajax
                // so we just return so this function has no effect and the form should post
                // normally.  Hopefully this does not cause headaches down the line
                return;
            }

            // If there is no 'waitforit' div in the dom yet
            if ($form.find('#waitforit').length == 0) {

                // then add it after the submit button of the form - this div indicates to the user that
                // they should wait while the form submits.  Also we disable the submit buttons
                $form.find('.modal-btns').after('<div id="waitforit"><i class="fa fa-cog fa-spin"></i><span> &nbsp;Please wait...</span></div>');
                $form.find('input[type="submit"], button[type="submit"]').attr('disabled', 'disabled');
            }

            // grab the 'target' element for this modal, which is determined by the 'data-target' attribute
            // it indicates the ID of the element that should have its innerHTML updated with the response
            // HTML of the ajax request (if it returns HTML)
            var $target = $($form.closest('.modal').attr('data-target'));

            // submit the form via ajax instead of normally
            $.ajax({
                type: $form.attr('method'),
                url: $form.attr('action'),
                data: $form.serialize(),

                // HTTP codes and functions to be called when the response has the corresponding code.
                statusCode: {

                    // if we got a Forbidden response returned then
                    // reload the page because it is likely that the user
                    // has been logged out and this was caught by our
                    // AjaxAuthenticationListener
                    403: function() {
                        window.location.reload();
                    }
                },

                // on successfuly completing the ajax request
                success: function(data, status) {

                    // if the response is JSON and has a redirect data item
                    if (data.redirect) {
                        // data.redirect contains the string URL to redirect to
                        window.location.replace(data.redirect);

                        // else we have normal html
                    } else if (data.reload) {

                        // Get rid of the hash - since the modal will still
                        // be there and will then auto launch after the redirect
                        // @todo What we really want to do here is just remove the modal
                        // value but this is quicker for now, since we dont use the hash for
                        // anything else yet
                        // window.location.hash = '';
                        createHashUrl();

                        window.location.reload();
                    } else {

                        //remove the 'waitforit' message and re-enable the submit button
                        $form.find('#waitforit').remove();
                        $form.find('input[type="submit"], button[type="submit"]').removeAttr('disabled');

                        // data.form contains the HTML for the replacement form
                        $target.find('.modal-dialog').html(data);
                        bindModalAjaxForms();
                    }
                }
            });

            event.preventDefault();
        });
    }

    /**
     * This binds all modal links to open their targets into a modal
     * and then run some code after.
     *
     * @returns boolean
     */
    bindModalLinks = function () {

        // We no longer use this function as it hijacks the way that normal Bootstrap modals work which means
        // we can't use this bundle alongside normal bootstrap modals.  This logic is no longer necessary given
        // that we use the hashChange to launch modals
        return true;

        // first unbind any click listners (to prevent multiple calls
        // to this function for adding this binding over and over
        $("a[data-toggle='modal']").unbind('click');

        // we bind a function to A tags that have data-toggle=modal.  Note that this Overrides the default
        // Bootstrap functionality that loads remote URL data into the modal.  The reason we do this is so
        // that we can run some code after the remove data has been loaded.  In this case, we call
        // bindModalAjaxForms()
        $("a[data-toggle='modal']").on('click', function (event) {

            // launch the modal
            $('#emptyModal').modal();

            var jqxhr = $.get( $(this).attr('href'), function(response, status, xhr) {

                // @todo deal with the status as we do in launchModal() actually we should just fire that method from here

                // first empty the modal
                $('#emptyModal').find('.modal-dialog').empty();

                // then load the new content
                $('#emptyModal').find('.modal-dialog').html(response);

                // then run the postPopulateModal function
                postPopulateModal();
            })
                .fail(function(xhr, textStatus) {
                    if (xhr.status == '403') {

                        // Get rid of the hash - since the modal will still
                        // be there and will then auto launch after the redirect
                        // @todo What we really want to do here is just remove the modal
                        // value but this is quicker for now, since we dont use the hash for
                        // anything else yet
                        // window.location.hash = '';
                        createHashUrl();
                        window.location.reload();
                    }
                });

            return false;
        });
    };
    // This function should be called after we populate a modal with any data
    postPopulateModal = function() {

        bindModalAjaxForms();
        bindModalLinks();
    };

    // This function looks at the window.location.hash string as a
    // query string style key value pair stirng and extracts a variable
    // using the passed variable as the key
    getHashVariable = function(variable) {

        // get the whole hash variable without the leading #
        var query = window.location.hash.replace('#','');

        // split into constituent key value pairs based on &
        var vars = query.split('&');

        // for each key value
        for (var i = 0; i < vars.length; i++) {

            // split into the key value pair based on =
            var pair = vars[i].split('=');

            // if the key is the variable we are looking for
            if (decodeURIComponent(pair.shift()) == variable) {

                // then join the rest of the array (its probably just
                // one value, but there might be more if it included
                // more = characters, in the case of a modal window
                // having query string variables for example)
                return decodeURIComponent(pair.join('='));
            }
        }

        return false;
    }


    // detect if the window.location.hash changes, if it does then
    // check if we have a #modal= value, if we do then we launch
    // our modal window
    window.addEventListener('hashchange', launchModal, false);
    function launchModal() {
        var modalLocation = getHashVariable('modal');

        if (modalLocation == false) {

            // nothing to do here.. no modal location is present in the
            // request
            return false;
        } else {

            // launch the modal
            $('#emptyModal').modal();

            var jqxhr = $.get( modalLocation, function(response, status, xhr) {

                if ( status == "error" ) {

                    // if we got a Forbidden response returned then
                    // reload the page because it is likely that the user
                    // has been logged out and this was caught by our
                    // AjaxAuthenticationListener
                    if (xhr.status == '403') {

                        // Get rid of the hash - since the modal will still
                        // be there and will then auto launch after the redirect
                        // @todo What we really want to do here is just remove the modal
                        // value but this is quicker for now, since we dont use the hash for
                        // anything else yet
                        // window.location.hash = '';
                        createHashUrl();
                        window.location.reload();
                    }
                } else {

                    // first empty the modal
                    $('#emptyModal').find('.modal-dialog').empty();

                    // then load the new content
                    $('#emptyModal').find('.modal-dialog').html(response);

                    // then run the postPopulateModal function
                    postPopulateModal();
                }

            })
                .fail(function(xhr, textStatus) {

                    if (xhr.status == '403') {

                        // Get rid of the hash - since the modal will still
                        // be there and will then auto launch after the redirect
                        // @todo What we really want to do here is just remove the modal
                        // value but this is quicker for now, since we dont use the hash for
                        // anything else yet
                        // window.location.hash = '';
                        createHashUrl();
                        window.location.reload();
                    }
                });

        }
    }

    // When our modal is hidden, then unset the hash.
    // @todo What we really want to do here is just remove the modal
    // value but this is quicker for now, since we dont use the hash for
    // anything else yet
    $('#emptyModal').on('hide.bs.modal', function (e) {
        // window.location.hash = '';
        // get the whole hash variable without the leading #

        createHashUrl();
    });

    //
    //            this function looks for any a tags within the target element
    //    that need to be bound to ajax calls with populations after
    //            @todo explain this better

    bindAjaxCallPopulate = function (targetElement) {

        // find any matching a tags within the target element and
        // bind a click event
        targetElement.find('a.ajax-call-populate').click(function(e) {

            // prevent the default stuff
            e.preventDefault();

            // store the a tag in a variable so we can access it
            // within the success call in the ajax call below
            var aTag = $(this);

            // toggle any visuals that need to be toggled while the Ajax call is made
            processToggle(aTag);

            // perform the
            handleAjaxCallPopulate(aTag.attr('href'), '#' + aTag.data('target-element'), 'GET');

        });
    }


    //            This method takes a URL and an element ID (in the form #id).
    //    It will make an ajax call to the URL to collect some HTML, it
    //    will then find the element with the ID within that HTML, then
    //    search for the same element on the current page and replace the
    //    element with the new one from the Ajax'ed HTML.

    handleAjaxCallPopulate = function(url, targetElementJQueryId, type) {

        // Make an ajax call to the a tag target href
        $.ajax({
            url : url,
            type: type,

            // on success, inject the html into the target element
            success: function(html) {
                //alert(aTag.data('target-element'));
                //alert(1);

                // find the new replacement element (even if it is the very top most element)
                var newElement = $(html).find(targetElementJQueryId).andSelf().filter(targetElementJQueryId);

                // Replace current position field ...
                $(targetElementJQueryId).replaceWith(
                    // ... with the returned one from the AJAX response.
                    newElement
                );
                bindAjaxCallPopulate($(targetElementJQueryId));
                //alert($(html).find('#' + aTag.data('target-element')));
                // Position field now displays the appropriate positions.
            }
        });
    };

    // when closing the modal this method will check if a hash
    // existed besides the modal has
    // if so reset the hash to that value
    createHashUrl = function() {
        var hash = window.location.hash;
        if (hash !== '') {
            var query = window.location.hash.replace('#','');
            var pairArray = [];
            var hashUrlArray = [];
            // split into constituent key value pairs based on &
            var vars = query.split('&');
            console.log(vars);
            for (var i = 0; i < vars.length; i++) {
                // split into the key value pair based on =
                var pair = vars[i].split('=');
                pairArray.push(pair);
            }
            $.each(pairArray, function (key, pair) {
                if (pair.indexOf('modal') === -1) {
                    var hashUrl = pair.join('=');
                    hashUrlArray.push(hashUrl);
                }
            });

            /**
             * We now set the hash value using replaceState so to not scroll to the anchor tag.  We fallback to
             * window.location.hash in older browsers
             * See: https://stackoverflow.com/questions/3870057/how-can-i-update-window-location-hash-without-jumping-the-document/17108603
             */
            if(history.replaceState) {
                history.replaceState(null, null, '#' + hashUrlArray.join('&'));
            }
            else {
                window.location.hash = '#' + hashUrlArray.join('&');
            }
        }
        if (hash === '') {

            /**
             * We now set the hash value using pushState so to not scroll to the anchor tag.  We fallback to
             * window.location.hash in older browsers
             * See: https://stackoverflow.com/questions/3870057/how-can-i-update-window-location-hash-without-jumping-the-document/17108603
             */
            if(history.replaceState) {
                history.replaceState(null, null, '#');
            }
            else {
                window.location.hash = '#';
            }
        }

    };

    // on page load initiate our ajaxCallPopulate links
    bindAjaxCallPopulate($body);

    // on page load we bind modal links
    bindModalLinks();

    // if there is a modal value in the hash on page load, then we want
    // to launch a modal on page load
    launchModal();

});
