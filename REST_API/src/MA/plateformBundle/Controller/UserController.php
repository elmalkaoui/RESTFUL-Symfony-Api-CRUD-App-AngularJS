<?php

namespace MA\plateformBundle\Controller;


use MA\plateformBundle\Entity\User;
use FOS\UserBundle\Entity\UserManager;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use FOS\RestBundle\Controller\Annotations as Rest;
use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\View\View;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\UsernamePasswordToken;
use Symfony\Component\Security\Http\Event\InteractiveLoginEvent;

#use Symfony\Bundle\FrameworkBundle\Controller\Controller;
#use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
#use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
#use Symfony\Component\HttpFoundation\Request;


class UserController extends FOSRestController
{
	/**
     * @Rest\Post("/signup", name="rest_register")
     */
    public function signupAction(Request $request)
    {
		$userManager = $this->get('fos_user.user_manager');
		$email_exist = $userManager->findUserByEmail($request->request->get('email'));
		if($email_exist)
			return new View("user already exist", Response::HTTP_OK);
		$user = $userManager->createUser();
		$user->setUsername($request->request->get('username'));
		$user->setEmail($request->request->get('email'));
		$user->setEmailCanonical($request->request->get('email'));
		$user->setAge($request->request->get('age'));
		$user->setRace($request->request->get('race'));
		$user->setNourriture($request->request->get('nourriture'));
		$user->setFamille($request->request->get('famille'));
		//$user->setLocked(0); 
		$user->setEnabled(1); 
		$user->setPlainPassword($request->request->get('password'));
		$userManager->updateUser($user);
			
			return new View("new user is created", Response::HTTP_OK);
    }
	
	/**
     * @Rest\Get("/redirect_login", name="rest_redirect_login")
     */
	public function RedirectloginAction(Request $request){
		return new View('redirection to login',Response::HTTP_OK);
	}
	
	/**
     * @Rest\Post("/signin", name="rest_login")
     */
	public function loginAction(Request $request){
			
		if ($this->get('security.authorization_checker')->isGranted('IS_AUTHENTICATED_FULLY')) {
			return new View('there is a user already logged in', Response::HTTP_OK);
		}	
		//get security encoder
		$factory = $this->get('security.encoder_factory');
		//retrieve user by username
		$user_manager = $this->get('fos_user.user_manager');
		$user = $user_manager->findUserByUsername($request->request->get('username'));
		//check if the user already signed upd
		if(!$user){
            return new View('Username doesnt exists',Response::HTTP_OK);
        }
		//starting verification
		$encoder = $factory->getEncoder($user);
        $salt = $user->getSalt();
		//check if the password is valid
		if(!$encoder->isPasswordValid($user->getPassword(), $request->request->get('password'), $salt)) {
            return new View('Username or Password not valid',Response::HTTP_OK);
        }
		$token = new UsernamePasswordToken($user, null, 'main', $user->getRoles());
        $this->get('security.token_storage')->setToken($token);
		$this->get('session')->set('_security_main', serialize($token));
		$event = new InteractiveLoginEvent($request, $token);
        $this->get("event_dispatcher")->dispatch("security.interactive_login", $event);
		return new view('welcome',Response::HTTP_OK);
	}
	
	/**
     * @Rest\Get("/hello", name="rest_hello")
     */
	public function helloAction(){
		return new View("hello world", Response::HTTP_OK);
	}
	
	/**
     * @Rest\Get("/users", name="rest_users")
     */
	public function UserAction(){
		$em = $this->getDoctrine()->getManager();
        $users = $em->getRepository('MAplateformBundle:User')->findAll();
        return $users;
	}
	
	/**
     * @Rest\Get("/friends", name="rest_friends")
     */
	public function FriendAction(){
		$user = $this->getUser();
		$friends = $user->getFriends();
        return $friends;
	}
	
	/**
     * @Rest\Get("/infos", name="rest_infos")
     */
	public function InfoAction(){
		$user = $this->getUser();
        return $user;
	}
	
	/**
     * @Rest\Post("/update", name="rest_update_infos")
     */
	 
	public function UpdateAction(Request $request){
		$userManager = $this->get('fos_user.user_manager');
		$user = $this->getUser();
		$user->setUsername($request->request->get('username'));
		$user->setEmail($request->request->get('email'));
		$user->setAge($request->request->get('age'));
		$user->setRace($request->request->get('race'));
		$user->setNourriture($request->request->get('nourriture'));
		$user->setFamille($request->request->get('famille'));
		$userManager->updateUser($user);
		return $user;
		
	}
	
	/**
     * @Rest\Post("/addfriend", name="rest_add_friend")
     */
	public function AddfriendAction(Request $request){
		$userManager = $this->container->get('fos_user.user_manager');
		$user = $this->getUser();
		$em = $this->getdoctrine()->getEntityManager();
		if($userManager->findUserBy(array('username'=>$request->request->get('friend')))!=null)
		if ($request->Ismethod('POST') and $userManager->findUserBy(array('username'=>$request->request->get('friend')))!=null ) {
			$user->addFriend($userManager->findUserBy(array('username'=>$request->request->get('friend'))));
			$userManager->updateUser($user);
		}
		
        $users = $em->getRepository('MAplateformBundle:User')->findAll();
		$em->flush();
        return new View('friend added', Response::HTTP_OK);
	}
	
	/**
     * @Rest\Post("/deletefriend", name="rest_delete_friend")
     */
	 
	public function RemovefriendAction(Request $request){
		$userManager = $this->container->get('fos_user.user_manager');
		$user = $this->getUser();
		$em = $this->getdoctrine()->getEntityManager();
		
		if ($request->Ismethod('POST')) {
			$user->removeFriend($userManager->findUserBy(array('username'=>$request->request->get('friend'))));
			$userManager->updateUser($user);
			$em->flush();
		}

        $users = $em->getRepository('MAplateformBundle:User')->findAll();
		
        return new View('Friend is removed', Response::HTTP_OK);
	}
}
