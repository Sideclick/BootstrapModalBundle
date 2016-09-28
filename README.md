# BootstrapModalBundle
Bundle for Symfony 2.6+ that makes it easy to load pages into a Bootstrap modal window.

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
        new Sideclick\EntityHelperBundle\SideclickBootstrapModalBundle(),
    );
}
```

### Step 3: Include the JS file and the empty modal div just before your closing </body> tag on any page that you want to be able to open a modal window.
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

And that's it!
