# WebGL-Amusement-Park
First, The images must be available to the HTML file, which is usually not the case with chrome or firefox initially (but is the case for Internet Explorer), so files must either be hosted on server or the preferred browser must be run with permissions to access files like so:
1. Find the Chrome application on your system.  One way to do this is to right-click on an existing shortcut and select "Open File Location".

2. Now create a fresh shortcut to the application on the desktop.  Right-click on the application, select "send to ->" and then select "Desktop ( create shortcut )".  This may produce a second shortcut to Chrome on your desktop, but that is okay. Rename the new shortcut to indicate it allows local file access.

3. Right click the new shortcut and select properties.  The "Target" field should have the full pathname to the executable program, ...../chrome.exe .  At the end of this line append --allow-file-access-from-files

4. Now use the new shortcut to run the program that needs to load local texture files.  ( E.g. launch chrome using the new shortcut, and then drag your html file onto it. )

Or with Visual Studio code, the html may be run as server with the "Live Server Extension" which also allows chrome to access the image files

After ensuring chrome or any preferred browser can access the imaages, simply run the html file.
The program should look something like the screenshot provided if run correctly

It utilizes dynamic and compound graphic motions, different files for different primiitive objectes, different types of lighting being used simultaneously, and allows for switching between different models of lighting as well as different light sources. More documentation provided in the  html itself. 

An example of how it looks is given here:
![screenshot](https://user-images.githubusercontent.com/60198023/147239770-7e150711-4790-4d06-898f-38dc817acc45.png)
