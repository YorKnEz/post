const root = document.querySelector('#lyrics')
let range
let region

// realize the annotation on the selected text range
const annotate = () => {
    // create the annotated element
    region = document.createElement('a')
    region.classList.add('poem__annotated', 'poem__annotated--active')

    if (range.startContainer == range.endContainer) {
        let beforeRegion = document.createTextNode(
            range.startContainer.nodeValue.substr(0, range.startOffset)
        )

        region.innerHTML = range.startContainer.nodeValue.substr(
            range.startOffset,
            range.endOffset - range.startOffset
        )

        let afterRegion = document.createTextNode(
            range.startContainer.nodeValue.substr(range.endOffset)
        )

        root.insertBefore(afterRegion, range.startContainer)
        root.insertBefore(region, afterRegion)
        root.insertBefore(beforeRegion, region)

        root.removeChild(range.startContainer)

        return
    }

    // console.log('lets go')

    let beforeRegion = document.createTextNode(
        range.startContainer.nodeValue.substr(0, range.startOffset)
    )

    region.innerHTML = range.startContainer.nodeValue.substr(range.startOffset)

    let current = range.startContainer.nextSibling
    let prev

    while (current != range.endContainer) {
        // console.log(current)
        prev = current
        current = current.nextSibling

        if (prev.nodeName == '#text') {
            region.innerHTML += prev.nodeValue
            root.removeChild(prev)
        } else {
            region.appendChild(prev)
        }
    }

    region.innerHTML += range.endContainer.nodeValue.substr(0, range.endOffset)

    let afterRegion = document.createTextNode(
        range.endContainer.nodeValue.substr(range.endOffset)
    )

    root.insertBefore(afterRegion, range.startContainer)
    root.insertBefore(region, afterRegion)
    root.insertBefore(beforeRegion, region)

    root.removeChild(range.startContainer)
    root.removeChild(range.endContainer)
}

// creates the button that supports annotation
const createAnnotateButton = () => {
    let button = document.createElement('button')
    button.innerHTML = 'Annotate'
    button.classList.add('poem__annotate')
    button.onclick = annotate

    return button
}

const button = createAnnotateButton()

// hide the button from the screen
const removeButton = () => {
    if (document.body.contains(button)) {
        document.body.removeChild(button)
    }
}

// checks whether a node is annotated or is a child of an annotated element
const annotated = (node) => {
    return (
        node.parentNode.classList.contains('poem__annotated') ||
        node?.classList?.contains('poem__annotated')
    )
}

// updates the current selection
const handleSelection = (ev) => {
    if (ev.type == 'mouseup' && !window.getSelection) {
        removeButton()
        return
    }

    let selection = window.getSelection()

    if (selection.isCollapsed) {
        removeButton()
        return
    }

    range = selection.getRangeAt(0)
    let allText = true

    do {
        // make sure the selection is made within the root div
        if (
            !(
                root != range.startContainer &&
                root != range.endContainer &&
                root.contains(range.startContainer) &&
                root.contains(range.endContainer)
            )
        ) {
            allText = false
            break
        }

        // make sure end is not annotated, because otherwise weird checks have
        // to be done in the while below
        if (annotated(range.startContainer) || annotated(range.endContainer)) {
            allText = false
            break
        }

        let current = range.startContainer

        while (current != range.endContainer) {
            if (annotated(current)) {
                allText = false
                break
            }

            current = current.nextSibling
        }
    } while (0)

    if (!allText) {
        removeButton()
        return
    }

    const bounds = selection.getRangeAt(0).getBoundingClientRect()
    document.body.appendChild(button)
    button.style.top = window.scrollY + bounds.bottom + 4 + 'px'
    button.style.left =
        bounds.left +
        bounds.width / 2 -
        button.getBoundingClientRect().width / 2 +
        'px'
}

document.onmouseup = document.onselectionchange = handleSelection

document.onclick = (ev) => {
    handleDropdownDisappear(ev)
}

window.onresize = (ev) => {
    console.log('salut')
    alignDropdown()
    alignAnnotationBox()
}
