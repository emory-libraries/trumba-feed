<?php

// Parse the parameter.
$url = $_GET['url'];

// Initialize CURL.
$request = curl_init();

// Set options.
curl_setopt($request, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($request, CURLOPT_URL, $url);
curl_setopt($request, CURLOPT_RETURNTRANSFER, true);
curl_setopt($request, CURLOPT_USERAGENT, $_SERVER['HTTP_USER_AGENT']);

// Get the data.
$result = curl_exec($request);

// Kill on errors.
if( !$result ):

  die('Error: "'.curl_error($request).'" - Code: '.curl_errno($request));
    
endif;

// Return results.
curl_close($request);

echo $result;

?>