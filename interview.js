function Map(arr) {
  if (!arr || arr.length == 0) return
  let newArray = []

  for (let i = 0; i < arr.length; i++) {
    newArray.push(arr[i] + 1)
  }
  return newArray
}

//1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11

function Filter(arr) {
  if (!arr || arr.length == 0) return
  let newArray = []
  for (let i = 0; i < arr.length; i) {
    if (arr[i] > 5) newArray.push(arr[i])
  }
  return newArray
}
