# JsonCompare

Usage : node runModule.js

- option   
  1.  -v or -value : showing value 
  2.  -p or -path : showing full path
  3.  -debug : showing debug
   

JSON file settings to compare
- Key : Sequence name
- Value : List of files to compare
- Home directory can be replaced with "~".
  
```json
{
    "TestFile" : ["./test1.json", "./test2.json", "./test3.json"],
    "TestFileNone" : []
}
```