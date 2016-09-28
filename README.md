# BootstrapModalBundle
Bundle for Symfony 2.6+ that makes it easy to load pages into a Bootstrap modal window.  If a page loaded into a modal window contains a form, the form will submit via ajax.

## Installation

### Step 1: Add the following to the "require" section of composer.json

```
"sideclick/bootstrap-modal-bundle": "dev-master"
```

OR just require the bundle from the commandline

```
composer require sideclick/bootstrap-modal-bundle
```


### Step 2: Enable the bundle

Enable the bundle in the kernel:

``` php
<?php
// app/AppKernel.php

public function registerBundles()
{
    $bundles = array(
        // ...
        new Sideclick\BootstrapModalBundle\SideclickBootstrapModalBundle(),
    );
}
```

### Step 3:
Include the JS file and the empty modal div just before your closing </body> tag on any page that you want to be able to open a modal window.
```
<script src="{{ asset('bundles/sideclickbootstrapmodal/js/sideclick-bootstrap-modal.js') }}"></script>
<div class="modal fade" id="emptyModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-async data-target="#emptyModal">
    <div class="modal-dialog">
    </div>
</div>

```

## Usage

To open a page in a modal you now simply prefix the href value of a URL with '#modal='.  For example:

```
<a href="#modal=/login">Login</a>
```

This will cause the /login page to be loaded into the modal window instead of in the current tab.

## Optional: Suggested Structure of modal pages
The pages that you load into the modal window should follow the standard Bootstrap structure as described here http://getbootstrap.com/javascript/#modals

For quick reference here is the structure:
```
<div class="modal fade" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Modal title</h4>
      </div>
      <div class="modal-body">
        <p>One fine body&hellip;</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary">Save changes</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
```

## Optional: Redirecting & Reloading
The JavaScript controlling the modal windows will respond to specific reload & redirect requests.  You may trigger a complete page reload or a redirect by loading a page into the modal window that is generated with a custom response from your controller.  An example of both is described below.

```
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends BaseController
{
    // implement the BootstrapModalBundle Controller Trait which will
    // bring two methods: redirectWithAjaxSupport() & reloadWithAjaxSupport()
    use \Sideclick\BootstrapModalBundle\Controller\ControllerTrait;
    
    public function thisActionWillRedirect(Request $request)
    {
        return $this->redirectWithAjaxSupport($request, '/new/url')
    }
    
    public function thisActionWillReload(Request $request)
    {
        return $this->reloadWithAjaxSupport($request)
    }
}
```


And that's it!
