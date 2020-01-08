# BootstrapModalBundle
Bundle for Symfony 2.6+ that makes it easy to load pages into a Bootstrap modal window.  If a page loaded into a modal window contains a form, the form will submit via ajax.

> Version 0.* is compatible with symfony/symfony: ^2.6 | ^3.2

> Version 1.* is compatible with symfony/framework-bundle: ^3.3 | ^4.0 | ^5.0

## Installation

### Step 1: Require the bundle using Composer

```
composer require sideclick/bootstrap-modal-bundle
```


### Step 2: Enable the bundle

> If you using Symfony 4 this step will be done automatically.

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
Check if sideclick-bootstrap-modal.js is added to your Bundles Assets folder.
If not run please -  php bin/console assets:install

<div class="modal fade" id="emptyModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" data-async data-target="#emptyModal">
    <div class="modal-dialog">
    </div>
</div>

<script src="{{ asset('bundles/sideclickbootstrapmodal/js/sideclick-bootstrap-modal.js') }}"></script>
```

## Step 3 (Webpack Encore Alternative)
If you using Webpack Encore you can also import the the SideclickModal class in your global js file.
```
import SideclickModal from '../../public/bundles/sideclickbootstrapmodal/javascript/sideclick_modal';

new SideclickModal();
```

### Step 4:
This bundle relies on Bootstrap 3.x or Bootstrap 4.x & jQuery 1.x  You must include those two libraries on any page using this bundle.

## Usage
### Old way of usage (Deprecated)
To open a page in a modal you now simply prefix the href value of a URL with '#modal='.  For example:

```
<a href="#modal=/login">Login</a>
```

This way is deprecated because it does not accommodate URL that already use hash values 

### New way of usage
To open a page in a modal you now simply add a data attribute - data-sideclick-modal-trigger and set href with the necessary URL .   For example:

```
<a href="/login" data-sideclick-modal-trigger>Login</a>
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
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;

class DefaultController extends Controller
{
    // implement the BootstrapModalBundle Controller Trait which will
    // bring three methods: redirectWithAjaxSupport(), reloadWithAjaxSupport() & redirectToRouteWithAjaxSupport()
    use \Sideclick\BootstrapModalBundle\Controller\ControllerTrait;
    
    public function thisActionWillRedirect(Request $request)
    {
        return $this->redirectWithAjaxSupport($request, '/new/url')
    }
    
    public function thisActionWillReload(Request $request)
    {
        return $this->reloadWithAjaxSupport($request)
    }
    
    public function thisActionWillReload(Request $request)
    {
        return $this->redirectToRouteWithAjaxSupport($request,'route_name',['parameters'=>$parameters])
    }
}
```

If you are planning to use modals all over the place it is advisable to create a single 'base controller' from which all your other controllers extend.


And that's it!
