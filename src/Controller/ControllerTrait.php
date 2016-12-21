<?php

namespace Sideclick\BootstrapModalBundle\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

trait ControllerTrait
{

    /**
     * This function will do exactly the same thing as the redirect() function in the parent class, however, if the
     * request is an Ajax request, then instead of performing a normal redirect, we return some json containing a
     * variable called 'redirect' which is the URL that should be redirected to.  This is used so that we can perform
     * redirects from pages submitted by Ajax and avoid the redirected content appearing inside a Modal or something
     *
     * @param $request
     * @param $url
     * @param int $status
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectWithAjaxSupport(Request $request, $url, $status = 302)
    {
        // if the request is an ajax one
        if ($request->isXmlHttpRequest()) {

            // then return some json which tells our JS to perform a redirect
            // @todo - Maybe we need to send the status through?
            return new JsonResponse(array('redirect' => $url));

            // else this is a normal request
        } else {

            // perform a normal redirect
            return $this->redirect($url, $status);
        }
    }

    /**
     * This method will return a Response object which will cause the current
     * page to be reloaded.  If it is an ajax request then it will send an
     * instruction back to our modal ajax handler, otherwise it will just
     * perform a PHP redirect back to the current url.
     *
     * @param $request
     *
     * @return \Symfony\Component\HttpFoundation\JsonResponse
     */
    public function reloadWithAjaxSupport(Request $request)
    {

        // if the request is an ajax one
        if ($request->isXmlHttpRequest()) {

            // then return some json which tells our JS to perform a window
            // reload
            return new JsonResponse(array('reload' => true));

            // else this is a normal request
        } else {

            // perform a normal redirect back to the current page
            return $this->redirect($request->getUri());
        }
    }

    /**
     * This function will do exactly the same thing as the redirect() function in the parent class, however, if the
     * request is an Ajax request, then instead of performing a normal redirect, we return some json containing a
     * variable called 'redirect' which is the URL that should be redirected to.  This is used so that we can perform
     * redirects from pages submitted by Ajax and avoid the redirected content appearing inside a Modal or something
     *
     * @param $request
     * @param $url
     * @param int $status
     *
     * @return JsonResponse|\Symfony\Component\HttpFoundation\RedirectResponse
     */
    public function redirectWithRouteNameAjaxSupport(Request $request, $url, $status = 302)
    {
        // if the request is an ajax one
        if ($request->isXmlHttpRequest()) {

            //convert route name to url
            $url = $this->generateUrl($url);

            // then return some json which tells our JS to perform a redirect
            // @todo - Maybe we need to send the status through?
            return new JsonResponse(array('redirect' => $url));

            // else this is a normal request
        } else {

            // perform a normal redirect
            return $this->redirect($url, $status);
        }
    }
}
