// const $ = require('jquery');

class SideclickModal {
    constructor() {

        this.$body = $('body');

        // When our emptyModal is closed we remove it's content so that when it is filled
        // again then it will accept the new content, as per:
        // http://stackoverflow.com/questions/12286332/twitter-bootstrap-remote-modal-shows-same-content-everytime
        this.$body.on(
            'hidden.bs.modal',
            '.modal',
            this.handleClearingOutModal.bind(this)
        );

        // New click listener to set the path to the modal url
        // will first check to see if a hash url exit
        // if a hash does exist the append modal url to it else
        // set the hash url to the modal hash
        this.$body.on(
            'click',
            'a[data-sideclick-modal-trigger]',
            this.handleModalTrigger.bind(this)
        );

        // detect if the window.location.hash changes, if it does then
        // check if we have a #modal= value, if we do then we launch
        // our modal window
        $(window).on(
            'hashchange',
            this.handleLaunchModal.bind(this)
        );

        // on page load initiate our ajaxCallPopulate links
        this.bindAjaxCallPopulate(this.$body);

        // on page load we bind modal links
        this.bindModalLinks();

        // if there is a modal value in the hash on page load, then we want
        // to launch a modal on page load
        this.launchModal();
    }

    // clear all the previously loaded content out from inside the modal dialog
    handleClearingOutModal(e){
        const $modal = $(e.currentTarget);
        $modal.removeData('bs.modal');

        $('#emptyModal').find('.modal-dialog').empty();

        this.createHashUrl();
    }

    handleModalTrigger(e){
        e.preventDefault();

        let $modalUrl = $(e.currentTarget).attr('href');
        // if ($modalUrl.indexOf('#modal=')) {}
        if ($modalUrl.indexOf('#modal=') !== -1){
            $modalUrl = $modalUrl.substring(7, $modalUrl.length);
        }

        const modal = 'modal=' + $modalUrl;
        if (window.location.hash === '') {
            window.location.hash = modal;
        }else {
            const currentHash = window.location.hash.replace('#','');
            window.location.hash = currentHash + '&' + modal;
        }
    }

    handleLaunchModal(){
        const modalLocation = this.getHashVariable('modal');

        if (modalLocation == false) {

            // nothing to do here.. no modal location is present in the
            // request
            return false;
        } else {

            // launch the modal
            $('#emptyModal').modal();

            const self = this;

            const jqxhr = $.get( modalLocation, function(response, status, xhr) {

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
                        self.createHashUrl();
                        window.location.reload();
                    }
                } else {

                    // first empty the modal
                    $('#emptyModal').find('.modal-dialog').empty();

                    // then load the new content
                    $('#emptyModal').find('.modal-dialog').html(response);

                    // then run the postPopulateModal function
                    self.postPopulateModal();
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
                        self.createHashUrl();
                        window.location.reload();
                    }
                });

        }
    }

    // This function looks at the window.location.hash string as a
    // query string style key value pair stirng and extracts a variable
    // using the passed variable as the key
    getHashVariable(variable) {

        // get the whole hash variable without the leading #
        const query = window.location.hash.replace('#','');

        // split into constituent key value pairs based on &
        const vars = query.split('&');

        // for each key value
        for (let i = 0; i < vars.length; i++) {

            // split into the key value pair based on =
            const pair = vars[i].split('=');

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

    // when closing the modal this method will check if a hash
    // existed besides the modal has
    // if so reset the hash to that value
    createHashUrl() {
        let hash = window.location.hash;
        if (hash !== '') {
            const query = window.location.hash.replace('#','');
            const pairArray = [];
            const hashUrlArray = [];
            // split into constituent key value pairs based on &
            const vars = query.split('&');
            // console.log(vars);
            for (let i = 0; i < vars.length; i++) {
                // split into the key value pair based on =
                let pair = vars[i].split('=');
                pairArray.push(pair);
            }
            $.each(pairArray, function (key, pair) {
                if (pair.indexOf('modal') === -1) {
                    let hashUrl = pair.join('=');
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

    }

    // This function should be called after we populate a modal with any data
    postPopulateModal() {

        this.bindModalAjaxForms();
        this.bindModalLinks();
    }


    // This function should be called after a form has been loaded into the #emptyModal with the 'data-async'
    // attribute (which indicates that the from should submit via Ajax)  It hooks into the submit event
    // on any forms within the modal and submits the form via ajax and deals with the response appropriately
    // NOTE that this function check to see if the form has any file inputs.  If it does then it will
    // not do anything
    bindModalAjaxForms() {

        const self = this;
        $('#emptyModal[data-async] form').on('submit', function(event) {

            // grab the form
            const $form = $(event.currentTarget);

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
            const $target = $($form.closest('.modal').attr('data-target'));

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
                        self.createHashUrl();

                        window.location.reload();
                    } else {

                        //remove the 'waitforit' message and re-enable the submit button
                        $form.find('#waitforit').remove();
                        $form.find('input[type="submit"], button[type="submit"]').removeAttr('disabled');

                        // data.form contains the HTML for the replacement form
                        $target.find('.modal-dialog').html(data);
                        self.bindModalAjaxForms();
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
    bindModalLinks() {

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

        const self = this;
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
                this.postPopulateModal();
            })
                .fail(function(xhr, textStatus) {
                    if (xhr.status == '403') {

                        // Get rid of the hash - since the modal will still
                        // be there and will then auto launch after the redirect
                        // @todo What we really want to do here is just remove the modal
                        // value but this is quicker for now, since we dont use the hash for
                        // anything else yet
                        // window.location.hash = '';
                        self.createHashUrl();
                        window.location.reload();
                    }
                });

            return false;
        });
    }


    //
    //            this function looks for any a tags within the target element
    //    that need to be bound to ajax calls with populations after
    //            @todo explain this better

    bindAjaxCallPopulate(targetElement) {

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

    launchModal() {
        var modalLocation = this.getHashVariable('modal');

        const self = this;

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
                        self.createHashUrl();
                        window.location.reload();
                    }
                } else {

                    // first empty the modal
                    $('#emptyModal').find('.modal-dialog').empty();

                    // then load the new content
                    $('#emptyModal').find('.modal-dialog').html(response);

                    // then run the postPopulateModal function
                    self.postPopulateModal();
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
                        self.createHashUrl();
                        window.location.reload();
                    }
                });

        }
    }

}

export default SideclickModal;

