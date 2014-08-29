/**
 * Created by randre03 on 8/28/14.
 */
var cluster = require('cluster');

function startWorker() {
    var worker = cluster.fork();
    console.log('CLUSTER: Worker %d started', worker.id);
}

if(cluster.isMaster) {
    require('os').cpus().forEach(function () {
        startWorker();
    });

    //log any workers that disconnected
    //if a worker disconnects it should then exit
    //so we would wait for the exit event to then
    // spawn another worker to replace it

    cluster.on('disconnect', function(worker) {
        console.log('CLUSTER: Worker %d disconnected from the cluster.', worker.id);
    });

    //when a worker exists, create a new worker to replace it
    cluster.on('exit', function(worker, code, signal) {
        console.log('CLUSTER: Worker %d died with exit code %d (%s)', workder.id, code, signal);
        startWorker();
    });
} else {
    // cluster.isMaster returned false meaning the script is being executed in the context of a worker
    // start the app on worker; see meadowlark.js
    require('./meadowlark');
}