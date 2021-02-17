const readline = require('readline');
const fs = require('fs');

function main() {
  const logFile = process.argv[2]
  if(!fs.existsSync(logFile)) {
    process.exit('USAGE: node check.js path/to/app.log')
  }
  const readInterface = readline.createInterface({
    input: fs.createReadStream(logFile),
    console: false
  });

  let lineCount = 0
  let lastTimestamp = null
  const largestGap = {
    stamp1:0,
    stamp2:0,
    gap:0
  }
  let topTen = []
  readInterface.on('line', function(line){
    lineCount++
    const timestamp = line.split(':').shift()
    // first trip
    if(lastTimestamp === null) {
      lastTimestamp = timestamp
    }

    // save the largest gap
    const diff = timestamp - lastTimestamp;
    if(diff < 0 ){
      console.log("calculated negative diff/gap -- log lines not written in order, test invalid")
      process.exit(1)
    }
    if(diff > largestGap.gap) {
      largestGap.stamp1 = lastTimestamp
      largestGap.stamp2 = timestamp
      // denormalized data -- monstrous.
      largestGap.gap = diff
    }

    // save the top 10 largest gaps
    topTen.push(diff)
    topTen.sort(function(a, b){return b-a})
    if(topTen.length > 10) {
      topTen = topTen.slice(0,10)
    }
    lastTimestamp = timestamp
  })

  readInterface.on('close', function() {
    console.log('your largest gap')
    console.log(largestGap)
    console.log('that\'s a gap of %s seconds', largestGap.gap / 1000)
    console.log('')
    console.log('your top 10 longest gaps (in miliseconds)')

    console.log(topTen)
    console.log('')
    console.log(`requests served: ${lineCount}`)
  })
}
main()
