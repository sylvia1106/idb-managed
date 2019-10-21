export function deduplicateList(list: any[]) {
    let deduplicatedList = list.reduce((accumulator, currentItem) => {
        if (accumulator.indexOf(currentItem) < 0) {
            return accumulator.concat(currentItem)
        } else {
            return accumulator
        }
    }, [])
    return deduplicatedList
}