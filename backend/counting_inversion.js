function countInversion(userRank, goalRank) {
    const ind = userRank.map(track => goalRank.indexOf(track));
    const { inversions } = mergeSort(ind);
    return inversions;
}

function mergeSort(z) {
    if (z.length <= 1) return { sorted: z, inversions: 0 };

    const mid = Math.floor(z.length / 2); // mediana
    const left = mergeSort(z.slice(0, mid));
    const right = mergeSort(z.slice(mid));

    return merge(left, right);
}

function merge({ sorted: left, inversions: leftInv }, { sorted: right, inversions: rightInv }) {
    const result = [];
    let inversions = leftInv + rightInv;
    let i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) {
            result.push(left[i++]);
        } else {
            inversions += left.length - i;
            result.push(right[j++]);
        }
    }

    return {
        sorted: result.concat(left.slice(i)).concat(right.slice(j)),
        inversions
    };
}

function calcSimilarity(userRank, goalRank) {
    const n = userRank.length;
    const maxInversions = (n * (n - 1) / 2);
    if (maxInversions === 0) return 100;

    const inv = countInversion(userRank, goalRank);

    return Math.round((1 - inv / maxInversions) * 100);
}

// mesmo funcionamento do acima, mas com passo a passo para modo didático

function collectSteps(arr, steps, trackNames) {
    if (arr.length <= 1) return { sorted: arr, inversions: 0 };

    const mid = Math.floor(arr.length / 2);
    const leftArr = arr.slice(0, mid);
    const rightArr = arr.slice(mid);

    steps.push({
        type: 'split',
        left: [...leftArr],
        right: [...rightArr],
        full: [...arr]
    });

    const left = collectSteps(leftArr, steps, trackNames);
    const right = collectSteps(rightArr, steps, trackNames);

    return mergeWithSteps(left, right, steps, trackNames);
}

function mergeWithSteps({ sorted: leftArr, inversions: leftInv },
    { sorted: rightArr, inversions: rightInv },
    steps, trackNames) {
    const result = [];
    let inversions = leftInv + rightInv;
    let i = 0, j = 0;

    while (i < leftArr.length && j < rightArr.length) {
        if (leftArr[i] <= rightArr[j]) {
            steps.push({
                type: 'compare',
                left: leftArr[i],
                right: rightArr[j],
                isInversion: false,
                inversionsAdded: 0
            });
            result.push(leftArr[i++]);
        } else {
            const inv = leftArr.length - i;
            inversions += inv;
            steps.push({
                type: 'compare',
                left: leftArr[i],
                right: rightArr[j],
                isInversion: true,
                inversionsAdded: inv
            });
            result.push(rightArr[j++]);
        }
    }

    const merged = result.concat(leftArr.slice(i)).concat(rightArr.slice(j));

    steps.push({
        type: 'merge',
        result: [...merged],
        inversions
    });

    return { sorted: merged, inversions };
}

function countInversionsWithSteps(userRank, referenceRank) {
    const indices = userRank.map(track => referenceRank.indexOf(track));
    const steps = [];
    const { inversions } = collectSteps(indices, steps);
    return { steps, inversions };
}