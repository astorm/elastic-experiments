# Express + Agent Event Loop Experiments

This project contains some code that allows us to throw a large amount of traffic at a simple express endpoint instrumented with the agent, have that agent reporting into an APM Server whose network _connection_ requests are timing out. 

These are not generic benchmarks -- their intent is to determine whether the above scenario generates a blocked event loop.  

## How To


After running `npm install` -- in three separate terminal windows

1. If an `results/app.log` from a previous test run exists, remove or rename it.

2. Start the mock APM Server
   ```
   % npm run start-mock-server
   ```

3. Start the instrumented application
   ```
   % npm run start-app-instrumented
   ```
   
4. Run the `autocannon` command to drive traffic at the application
   ```
   % npm run generate-traffic
   ```
   
## Reading the Results

For each individual request served, the application will log a line to `results/app.log`

    $ cat ./results/app.log          
    # ...
    1613512052923: handling request
    1613512052923: handling request
    1613512052923: handling request
    1613512052923: handling request
    1613512052924: handling request    
    
    [Javascript Timestamp]: handling request
    # ...

If the application's event loop is blocked, there will be longer than normal gaps between each individual request.  

The `check.js` script can parse these log lines and report back the longest gap (with timestamps), as well as the top ten gaps. 

    % node check.js
    your largest gap
    { stamp1: '1613516838441', stamp2: '1613516846358', gap: 7917 }
    that's a gap of 7.917 seconds

    your top 10 longest gaps (in miliseconds)
    [
      7917, 753, 706,
       686, 613, 463,
       404, 401, 328,
       272
    ]

We recommend starting the app _without_ instrumentation to generate a baseline of behavior to compare with the instrumented application. 
