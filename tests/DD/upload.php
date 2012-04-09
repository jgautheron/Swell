<?php

$uploadedFiles = array();
$inputName = 'files';
$imagePath = 'uploaded/';

for ($i = 0, $len = count($_FILES[$inputName]['name']); $i < $len; $i++) {
    // security check
    $image = getimagesize($_FILES[$inputName]['tmp_name'][$i]);
    if (!in_array($image['mime'], array('image/jpeg', 'image/png', 'image/gif'))) {
        continue;
    }
    
    // move the file in the tmp folder
    $fileName = uniqid() . substr($_FILES[$inputName]['name'][$i], strrpos($_FILES[$inputName]['name'][$i], '.'));
    move_uploaded_file($_FILES[$inputName]['tmp_name'][$i], $imagePath . $fileName);
    $uploadedFiles[] = $imagePath . $fileName;
}

echo implode('|', $uploadedFiles);