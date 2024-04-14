import { itterationDirection } from "../constants/constant";

const removeWhiteSpaceAtIndex = (inputString: String, index: number): String => {
    if (index < 0 || index >= inputString.length) {
        return inputString;
    }
    const beforeIndex = inputString.substring(0, index);
    const afterIndex = inputString.substring(index + 1);
    return beforeIndex + afterIndex;
}

const transformStringContent = (string: String): String => {
    // string = string.replace(/\s+/g, ' ');
    string = cleanWhitespace(string);
    let result = string;

    while(true){
        if(result.indexOf("\\[") === -1 && result.indexOf("\\]") === -1){
            break;
        } else {
            console.log(result[result.indexOf("\\[")+2])
            console.log(isWhitespaceAtIndex(result[result.indexOf("\\[")+2]))
            result = itterateWhiteSpaces(result, result.indexOf("\\[")+2, itterationDirection.forward)
            result = removeWhiteSpaceAtIndex(result, result.indexOf("\\[")+2);
            result = result.replace("\\[", "$");
            result = itterateWhiteSpaces(result, result.indexOf("\\]")-1, itterationDirection.backward)
            result = removeWhiteSpaceAtIndex(result, result.indexOf("\\]")-1);
            result = result.replace("\\]", "$$");
        }
    }
    console.log(result)
    
    return result.replace(/\$\$/g, '$');
}

const itterateWhiteSpaces = (text: String, index: number, direction = itterationDirection.forward) : String => {
    while(true){
        if(direction == itterationDirection.forward){
            if(isWhitespaceAtIndex(text[index])){
                text = removeWhiteSpaceAtIndex(text, index)
            } else {
                break;
            }
        } else {
            if(isWhitespaceAtIndex(text[index - 1])){
                text = removeWhiteSpaceAtIndex(text, index);
                index--;
            } else {
                break;
            }
        }
    }
    return text;
}

const isWhitespaceAtIndex = (text: string) => {
    return /\s/.test(text);
}

const cleanWhitespace =(text: String) : String => {
    return text.split('\n').map(line => line.trim().replace(/[ \t]+/g, ' ')).join('\n');
}

export {
    transformStringContent
}