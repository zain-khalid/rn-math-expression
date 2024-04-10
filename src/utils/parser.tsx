const removeWhiteSpaceAtIndex = (inputString: String, index: number): String => {
    if (index < 0 || index >= inputString.length) {
        return inputString;
    }
    const beforeIndex = inputString.substring(0, index);
    const afterIndex = inputString.substring(index + 1);
    return beforeIndex + afterIndex;
}

const transformStringContent = (string: String): String => {
    let result = string;

    while(true){
        if(result.indexOf("\\[") === -1 && result.indexOf("\\]") === -1){
            break;
        } else {
            result = removeWhiteSpaceAtIndex(result, result.indexOf("\\[")+2);
            result = result.replace("\\[", "$");
            result = removeWhiteSpaceAtIndex(result, result.indexOf("\\]")-1);
            result = result.replace("\\]", "$");
        }
    }
    
    return result.replace(/\$\$/g, '$');
}

export {
    transformStringContent
}