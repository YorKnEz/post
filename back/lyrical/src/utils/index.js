import { ErrorCodes, JSONResponse, getAuthMiddleware } from 'web-lib'

export * from './email.js'
export * from './validation.js'

export const authMiddleware = getAuthMiddleware(process.env.AUTH_SERVICE_API_URL)

export const adminMiddleware = async (req, res, next) => {
    if (!(req.locals.userRoles & 0b10)) {
        return new JSONResponse(403, {
            code: ErrorCodes.UNAUTHORIZED,
            message: 'You are not an admin'
        })
    }

    return await next(req, res)
}

const updateIntervals = (deletions, annotations) => {
    let updatedAnnotations = []
    annotations.sort((a, b) => a.offset - b.offset)
    let i, j

    for (i = 0, j = 0; i < annotations.length && j < deletions.length;) {
        if (deletions[j].end < annotations[i].offset) {
            //-----[---------]--- annotation
            //-[-]--------------- deletion
            //go to the next deletion
            j++
            continue
        }

        if (annotations[i].offset + annotations[i].length - 1 < deletions[j].start) {
            //-----[-------]----- annotation
            //---------------[-]- deletion
            //save current annotation
            updatedAnnotations.push(annotations[i])
            //go to the next annotation
            i++
            continue
        }

        if (deletions[j].start <= annotations[i].offset && annotations[i].offset + annotations[i].length - 1 <= deletions[j].end) {
            //-----[-------]----- annotation
            //---[-----------]--- deletion
            //save the current annotation with offset -1 so we know it needs to be deleted
            annotations[i].offset = -1
            updatedAnnotations.push(annotations[i])
            //go to the next annotation
            i++
            //we don't go to the next deletion
            //the current one might still affect other annotations
            continue
        }

        if (deletions[j].start <= annotations[i].offset) {
            //-----[-------]----- annotation
            //--[-----]---------- deletion
            //update the offset of the annotation
            annotations[i].offset = -1
            updatedAnnotations.push(annotations[i])
            //go to the next annotation
            i++
            //go to next deletion
            j++
            continue
        }

        if (annotations[i].offset + annotations[i].length - 1 <= deletions[j].end) {
            //-----[---------]--- annotation
            //----------[------]- deletion
            //update the offset of the annotation
            annotations[i].offset = -1
            updatedAnnotations.push(annotations[i])
            //go to the next annotation
            i++
            continue
        }

        //-----[---------]--- annotation
        //--------[-]-------- deletion
        //update length
        annotations[i].offset = -1
        updatedAnnotations.push(annotations[i])
        //go to the next annotation
        i++
        //go to next deletion
        j++
    }

    //remaining annotations are not changed by any deletions
    for (; i < annotations.length; i++) {
        updatedAnnotations.push(annotations[i])
    }

    return updatedAnnotations
}

export const meyersDiff = (old, curr, annotations) => {
    const m = old.length
    const n = curr.length
    const max = m + n
    const V = Array(2 * max + 1).fill(0)
    const currentTrace = Array(2 * max + 1).fill(null)

    // go through every possible edit distance in ascending order
    // first one that makes a valid edit path is the shortest possible
    for (let d = 0; d <= max; d++) {
        for (let k = -d; k <= d; k += 2) {
            let x
            let y
            let prevK
            let op

            if (k == -d || (k != d && V[k - 1 + max] < V[k + 1 + max])) {
                x = V[k + 1 + max]
                prevK = k + 1
                op = 'insert'
            } else {
                x = V[k - 1 + max] + 1
                prevK = k - 1
                op = 'delete'
            }

            y = x - k

            // clone previous operations and add the current operation
            const operations = currentTrace[prevK + max] ? [...currentTrace[prevK + max]] : []
            operations.push({ type: op, x: op === 'delete' ? x - 1 : x, y: op === 'insert' ? y : y - 1 })

            // extend the "snake" of matching characters
            while (x < m && y < n && old[x] === curr[y]) {
                x++
                y++
                operations.push({ type: 'match', x, y })
            }

            V[k + max] = x
            currentTrace[k + max] = operations

            // check if we have reached the end of both strings
            if (x >= m && y >= n) {
                const deletions = operations.filter(op => op.type === 'delete')
                if (deletions.length == 0) {
                    return annotations
                }

                let deletionIntervals = []
                let interval = {
                    start: deletions[0].x,
                    end: deletions[0].x
                }

                //extract the intervals that have been removed from the old string
                for (let i = 1; i < deletions.length; i++) {
                    if (deletions[i].x == deletions[i - 1].x + 1) {
                        interval.end++;
                    }
                    else {
                        deletionIntervals.push({...interval})
                        interval.start = deletions[i].x
                        interval.end = deletions[i].x
                    }
                }
                deletionIntervals.push(interval)

                return updateIntervals(deletionIntervals, annotations)
            }
        }
    }
    return annotations;
}
