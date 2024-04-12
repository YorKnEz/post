const autoGrow = (oField) => {
    if (oField.scrollHeight > oField.clientHeight) {
        oField.style.height = `${oField.scrollHeight}px`
    }
}

autoGrow(document.getElementById('lyrics'))

const handleSave = (ev) => {
    console.log('save')
}

const handleCancel = (ev) => {
    location.replace('../poem/')
}
