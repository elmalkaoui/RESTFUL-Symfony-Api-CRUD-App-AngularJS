<?php

namespace MA\plateformBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class DefaultController extends Controller
{
    public function indexAction()
    {
        return $this->render('MAplateformBundle:Default:index.html.twig');
    }
}
