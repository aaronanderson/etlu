Font conversion:

Download Font:
cat etlu/xr-server/node_modules/@workday/canvas-kit-css-fonts/lib/fonts.scss
https://design.workdaycdn.com/beta/assets/fonts@1.0.0/roboto/ttf/RobotoMono-Regular.ttf

Follow instructions at https://github.com/briantbutton/meshwriter-font

git clone https://github.com/briantbutton/meshwriter.git
git clone https://github.com/briantbutton/meshwriter-font.git


mkdir meshwriter-font/fonts
cp ~/Downloads/RobotoMono-Regular.ttf meshwriter-font/fonts
cd meshwriter-font

Open the glyph-inspector.html file in a browser. Load the RobotoMono-Regular.ttf fonts. View the available characters.

edit config.js. copy the "helveticaneue-medium" and rename the copy to "coverage". Add any additional font characters that should be included to the array.

node
> require("./index")
> convertFontFile({suffix:"ttf",name:"RobotoMono-Regular",compress:true})
.exit


cd ../meshwriter
npm install

[1] git apply rmr.patch
npm run build

cp dist/meshwriter.js ../etlu/modules/core/src/main/web/components


Threads on usage in ES6: 
https://forum.babylonjs.com/t/meshwriter-integration-in-angular-babylon-project/10347/6
https://doc.babylonjs.com/extensions/mesh_writer_introduction

import * as BABYLON from '@babylonjs/core/Legacy/legacy';
(<any>window).BABYLON = BABYLON;
declare const MeshWriter: any;
import '../components/meshwriter';

...

    const Writer  =  MeshWriter(scene, { 'default-font':'RobotoMono-Regular', scale: .5, debug: true});//
    const text1     = new Writer(                                  
                   "ABC",
                   {
                       "anchor": "center",
                       "letter-height": 5,
                       "color": "#FFF",
                       "position": {
                           "y": -2,
                           "z": -3

                     }
                    }
             );
    const textMesh  = text1.getMesh();
    //textMesh.position.y = -1;
     scene.removeMesh(textMesh);
     assetContainer.meshes.push(textMesh);



SVG Conversion: 

Install Blender, start it.

File -> New -> General

Delete the Cube from the Scene Collection

File -> Import -> Scalable Vector Graphic (.svg)

Navigate to etlu/xr-server/node_modules/@workday/canvas-system-icons-web/dist/svg/

select wd-icon-arrow-down.svg

Select the SVG in the top right Scene Collection hierarchy, then select the child curve, then select the SVG again


In the editor, below the scene collection, do the following:

Object Properties -> Transform -> Scale, set the X,Y, and Z values to 100.0

Object Data Properties -> Geometry -> extrude -> 0.0005 m

File -> Export -> glTF 2.0

File name: wd-icon-arrow-down 
Press Export glTF 2.0

Go to https://sandbox.babylonjs.com/, load the glTF file and verify it renders as expected.

1:
git diff index.js > ../rmr.patch

cat ../rmr.patch 
diff --git a/index.js b/index.js
index c45c44a..8383df7 100644
--- a/index.js
+++ b/index.js
@@ -16,35 +16,40 @@
 
 define(
   // >>>>>  STEP 1 <<<<<
-  ['./fonts/hirukopro-book','./fonts/helveticaneue-medium','./fonts/comicsans-normal','./fonts/jura-demibold','./fonts/webgl-dings'],
-  function(HPB,HNM,CSN,JUR,WGD){
+  //['./fonts/hirukopro-book','./fonts/helveticaneue-medium','./fonts/comicsans-normal','./fonts/jura-demibold','./fonts/webgl-dings'],
+  //function(HPB,HNM,CSN,JUR,WGD){
+  ['./fonts/helveticaneue-medium','./fonts/robotomono-regular.js'],
+  function(HNM,RMR){
   // >>>>>  STEP 1 <<<<<
 
-    var scene,FONTS,defaultColor,defaultOpac,naturalLetterHeight,curveSampleSize,Γ=Math.floor,hpb,hnm,csn,jur,wgd,debug;
+    //var scene,FONTS,defaultColor,defaultOpac,naturalLetterHeight,curveSampleSize,Γ=Math.floor,hpb,hnm,csn,jur,wgd,debug;
+    var scene,FONTS,defaultColor,defaultOpac,naturalLetterHeight,curveSampleSize,Γ=Math.floor,hnm,rmr,debug;
     var b128back,b128digits;
     var earcut = require("earcut");
     prepArray();
     // >>>>>  STEP 2 <<<<<
-    hpb                          = HPB(codeList);
+    //hpb                          = HPB(codeList);
     hnm                          = HNM(codeList);                         // Do not remove
-    csn                          = CSN(codeList);
-    jur                          = JUR(codeList);
-    wgd                          = WGD(codeList);
+    //csn                          = CSN(codeList);
+    //jur                          = JUR(codeList);
+    //wgd                          = WGD(codeList);
+    rmr 						   = RMR(codeList);
     // >>>>>  STEP 2 <<<<<
     FONTS                        = {};
     // >>>>>  STEP 3 <<<<<
-    FONTS["HirukoPro-Book"]      = hpb;
+    //FONTS["HirukoPro-Book"]      = hpb;
     FONTS["HelveticaNeue-Medium"]= hnm;                                   // Do not remove
     FONTS["Helvetica"]           = hnm;
     FONTS["Arial"]               = hnm;
     FONTS["sans-serif"]          = hnm;
-    FONTS["Comic"]               = csn;
-    FONTS["comic"]               = csn;
-    FONTS["ComicSans"]           = csn;
-    FONTS["Jura"]                = jur;
-    FONTS["jura"]                = jur;
-    FONTS["WebGL-Dings"]         = wgd;
-    FONTS["Web-dings"]           = wgd;
+    //FONTS["Comic"]               = csn;
+    //FONTS["comic"]               = csn;
+    //FONTS["ComicSans"]           = csn;
+    //FONTS["Jura"]                = jur;
+    //FONTS["jura"]                = jur;
+    //FONTS["WebGL-Dings"]         = wgd;
+    //FONTS["Web-dings"]           = wgd;
+    FONTS["RobotoMono-Regular"]    = rmr;
     // >>>>>  STEP 3 <<<<<
     defaultColor                 = "#808080";
     defaultOpac                  = 1;
@@ -647,4 +652,4 @@ define(
     function weeid()              { return Math.floor(Math.random()*1000000) } ;
     function round(n)             { return Γ(0.3+n*1000000)/1000000 }
   }
-);
\ No newline at end of file
+);
