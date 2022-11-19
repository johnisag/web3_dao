// SPDX-License-Identifier: MIT
 pragma solidity ^0.8.1;

 contract MoodDiary{
     // state variable to keep the mood state
     string mood;

     // write 
    function setMood(string memory _mood) public{
        mood = _mood;
    }

     // read
     function getMood() public view returns(string memory){
         return mood;
     }
 }