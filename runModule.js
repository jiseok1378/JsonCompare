
import fs from 'fs'
import os from 'os'

const langFileList = Object.values(JSON.parse(fs.readFileSync('./targetFileList.json')))
const langFileKey = Object.keys(JSON.parse(fs.readFileSync('./targetFileList.json')))


const checkFlag = {
    TARGET : 'TARGET',
    CHECK : "CHECK",
    NON_CHECK: "NONE_CHECK"
}
let optionFlag = {
    showingValue : {
        option : ["-v", "-value"],
        flag : false
    }
}
process.argv.map(arg=>arg.toLowerCase()).forEach(arg=>{
    switch(arg){
        case "-v" :
        case "-value" : optionFlag.showingValue.flag = true;
            break;
    }
})
const initFiles = (fileList) =>{
    return fileList.map(file=>file.replace(/\~/g,os.homedir()))
                .map(file=>({
                    fileName:file,
                    json:JSON.parse(fs.readFileSync(file).toString()), 
                    flag : checkFlag.NON_CHECK
                }));
}

const switchTargetFile = (files,index) => {
    files[index].flag = checkFlag.TARGET;
    return files;
}

const checkInner = (checkTagetFile, noneFile, fileName, preKey) => {
    if(noneFile != null){
        const notFoundKeys = Object.keys(checkTagetFile).filter(x=>!Object.keys(noneFile).includes(x));
        if(notFoundKeys.length != 0) notFoundKeys.forEach((notFoundKey)=>{
            console.log(`\x1b[34m[${fileName}]\x1b[0m NOT FOUND KEY: ${preKey+ (preKey === ''? "" : ".") +notFoundKey}`)
            if(optionFlag.showingValue.flag) console.log(`[${fileName}]  KEY OF VALUE: ${checkTagetFile[notFoundKey]}`)
        })
    }
    Object.keys(checkTagetFile).forEach((key)=>{
        if(checkTagetFile[key] == undefined || checkTagetFile[key] == null || noneFile[key] == null){
            return;
        } 
        if(typeof(checkTagetFile[key]) === 'object') {
            const currentIndex = preKey === '' ?  key : ( preKey + "."+ key)
            checkInner(checkTagetFile[key], noneFile[key], fileName, currentIndex)
        }
    })
}

const checkLanguage = (checkTagetFile, noneFiles, langKey) =>{
    console.log(`\n\x1b[32m============================( ${checkTagetFile.fileName} )============================\x1b[0m`)
    for(let i = 0; i < noneFiles.length; i++){
        checkInner(checkTagetFile.json, noneFiles[i].json, noneFiles[i].fileName, '');    
    }
    console.log(`\x1b[32m============================( ${checkTagetFile.fileName} )============================\x1b[0m`)
}
const runCheckLanguageFileInner = (langFiles, langKey)=>{
    for(let i = 0; i < langFiles.length; i++){
        let checkingFiles = initFiles(langFiles);
        const switchedFile = switchTargetFile(checkingFiles,i);
        checkLanguage(
            switchedFile.filter(x=>x.flag == checkFlag.TARGET)[0],
            switchedFile.filter(x=>x.flag == checkFlag.NON_CHECK), langKey)
     }
}
const runCheckLanguageFile = ()=>{
    for(let i = 0; i < langFileList.length; i++){
        runCheckLanguageFileInner(langFileList[i], langFileKey[i])
    }

}
runCheckLanguageFile();