
const fs =  require('fs');
const os = require('os')
const util = require('util')
const path = require('path')
const chalk = require('chalk')
const log = console.log;

const langFileList = Object.values(JSON.parse(fs.readFileSync('./targetFileList.json')))
const langFileKey = Object.keys(JSON.parse(fs.readFileSync('./targetFileList.json')))
const objectConsoleOption =  {
    showHidden:true,
    depth:2
}
const checkFlag = {
    TARGET : 'TARGET',
    CHECK : "CHECK",
    NON_CHECK: "NONE_CHECK"
}
let optionFlag = {
    showingValue : {
        option : ["-v", "-value"],
        flag : false
    },
    fullPath :{
        option : ["-p", "-path"],
        flag : false
    },
    debug : {
        option : ["-debug"],
        flag : false
    }
}

process.argv.map(arg=>arg.toLowerCase()).forEach(arg=>{
    switch(arg){
        case "-v" :
        case "-value" : optionFlag.showingValue.flag = true;
            break;
        case '-p':
        case '-path': optionFlag.fullPath.flag = true; 
            break;
        case '-debug' : optionFlag.debug.flag = true; 
            break;
    }
})
const debugLog = (functionName, msg)=>{
    if(optionFlag.debug.flag){
        log(chalk.red(`\n==================( ${functionName} )==================`))
        log(msg)
        log(chalk.red(`==================( ${functionName} )==================\n`))
    }  
}
const replaceHomePathAddAndExistFilter = (fileList) =>{
    const ret = fileList.map(file=>file.replace(/\~/g,os.homedir()))
                        .filter(file=>{
                            if(fs.existsSync(file)) return true;
                            else{
                                log(`${chalk.red(`\nError:`)} Not exist file "${file}"`)
                                return false;
                            } 
                        });
    debugLog("replaceHomePathAddAndExistFilter",`debug ret\n${util.inspect(ret, objectConsoleOption)}`);
    return ret;
}
const initFiles = (fileList) =>{
    const ret = fileList.map(file=>({
                            fileName:file,
                            json:JSON.parse(fs.readFileSync(file).toString()), 
                            flag : checkFlag.NON_CHECK
                        }));
    debugLog("initFiles", `debug ret\n${util.inspect(ret, objectConsoleOption)}`)
    return ret;
    
}

const switchTargetFile = (files,index) => {
    debugLog("switchTargetFile",`debug files\n${util.inspect(files, objectConsoleOption)}\n\ndebug index ${index}`)
    files[index].flag = checkFlag.TARGET;
    return files;
}

const checkInner = (checkTargetFile, noneFile, fileName, preKey) => {
    debugLog('checkInner', 
            "checkTargetObject\n" +
            util.inspect(checkTargetFile,objectConsoleOption) +"\n" +
            "checkObject\n" + 
            util.inspect(noneFile, objectConsoleOption))

    const pureFileName = fileName.split(path.sep)[fileName.split(path.sep).length - 1]
    if(noneFile != null){
        const notFoundKeys = Object.keys(checkTargetFile).filter(x=>!Object.keys(noneFile).includes(x)); // ????????? key list
        if(notFoundKeys.length != 0) notFoundKeys.forEach((notFoundKey)=>{
            findFlag = true
            log(`[${chalk.blue.bold(optionFlag.fullPath.flag ? fileName : pureFileName)}] MSSING KEY: ${preKey+ (preKey === ''? "" : ".") +notFoundKey}`)
            if(optionFlag.showingValue.flag)
                log(`[${chalk.blue.bold(optionFlag.fullPath.flag ? fileName : pureFileName)}] MSSING VAL: ${checkTargetFile[notFoundKey]}\n`)
        })  
    }
    Object.keys(checkTargetFile).forEach((key)=>{
        if(checkTargetFile[key] == undefined || checkTargetFile[key] == null || noneFile[key] == null){
            return;
        } 
        if(typeof(checkTargetFile[key]) === 'object') {
            const currentIndex = preKey === '' ?  key : ( preKey + "."+ key)
            checkInner(checkTargetFile[key], noneFile[key], fileName, currentIndex)
        }
    })

}
let findFlag = false; 
const checkLanguage = (checkTargetFile, noneFiles, langKey) =>{

    log(chalk.gray(`\n[Compare] TARGET: ${checkTargetFile.fileName}`))
    for(let i = 0; i < noneFiles.length; i++){
        debugLog("checkLanguage", findFlag)
        checkInner(checkTargetFile.json, noneFiles[i].json, noneFiles[i].fileName, '');
    }
    if(!findFlag) console.log(chalk.green("Message : No missing key found."))    
    findFlag = false
}
const runCheckLanguageFileInner = (langFiles, langKey)=>{
    if(langFiles.length == 0) return 
    const replaceAndFilter = replaceHomePathAddAndExistFilter(langFiles);
    for(let i = 0; i < replaceAndFilter.length; i++){
        const checkingFiles = initFiles(replaceAndFilter);
        if(checkingFiles.length == 0) return 
        const switchedFile = switchTargetFile(checkingFiles,i);
        checkLanguage(
            switchedFile.filter(x=>x.flag == checkFlag.TARGET)[0],
            switchedFile.filter(x=>x.flag == checkFlag.NON_CHECK), 
            langKey);
     }
}
const runCheckLanguageFile = ()=>{
    for(let i = 0; i < langFileList.length; i++){
        log(chalk.yellow(`\nSequence: ${langFileKey[i]}`))
        runCheckLanguageFileInner(langFileList[i], langFileKey[i])
    }

}
runCheckLanguageFile();