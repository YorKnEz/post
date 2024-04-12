const annotationBox = document.getElementById('annotation')
let lastAnnotation

const handleAnnotationBoxClose = (ev) => {
    annotationBox.classList.add('hidden')
    lastAnnotation.classList.remove('poem__annotated--active')
}

const handleLike = (ev) => {
    console.log('like')
}

const handleDislike = (ev) => {
    console.log('dislike')
}

const handleAnnotationShare = (ev) => {
    console.log('share')
}

const alignAnnotationBox = () => {
    // dont align if element is hidden
    if (annotationBox.classList.contains('hidden')) {
        return
    }

    const bounds = annotationBox.getBoundingClientRect()
    const lyricsBounds = document.querySelector('#lyrics').getBoundingClientRect()

    annotationBox.style.top =
        Math.min(
            lastAnnotation.getBoundingClientRect().top - lyricsBounds.top,
            lyricsBounds.height - bounds.height
        ) + 'px'
}

document.querySelectorAll('.poem__annotated').forEach((annotation) => {
    annotation.onclick = (ev) => {
        annotationBox.classList.remove('hidden')
        lastAnnotation = annotation
        lastAnnotation.classList.add('poem__annotated--active')
        alignAnnotationBox()
    }
})
