const transformStringContent = (string: String): String => {
    return string.replace(/\$\$/g, '$');
}

export {
    transformStringContent
}