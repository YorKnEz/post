const annotateBox = document.getElementById('annotate')

const hideAnnotateBox = (ev) => {
    annotateBox.classList.add('annotation--hidden')
    location.reload()
    // region.classList.remove('poem__annotated--active')
}

const handleSave = (ev) => {
    console.log('save')
}

const alignAnnotateBox = () => {
    // dont align if element is hidden
    if (annotateBox.classList.contains('annotation--hidden')) {
        return
    }
    const bounds = annotateBox.getBoundingClientRect()
    const lyricsBounds = document
        .querySelector('#lyrics')
        .getBoundingClientRect()

    annotateBox.style.top =
        Math.min(
            region.getBoundingClientRect().top - lyricsBounds.top,
            lyricsBounds.height - bounds.height
        ) + 'px'
}

const showAnnotateBox = (ev) => {
    annotateBox.classList.remove('annotation--hidden')
    alignAnnotateBox()
}
