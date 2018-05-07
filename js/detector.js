
        var divRoot = $("#affdex_elements")[0];
        var width = 280;
        var height = 220;
        var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
        var aburrido = 0;
        var entretenido = 0;
        var neutral = 0;
        
        // Construct a CameraDetector and specify the image width / height and face detector mode.
        var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
        var reconocimiento = 1;
        var variable = 0;

        // Enable detection of all Expressions, Emotions and Emojis classifiers.
        detector.detectAllEmotions();
        detector.detectAllExpressions();
        detector.detectAllEmojis();
        detector.detectAllAppearance();
        detector.start();

        // Add a callback to notify when the detector is initialized and ready for runing.
        detector.addEventListener("onInitializeSuccess", function () {
        // Display canvas instead of video feed because we want to draw the feature points on it
        $("#face_video_canvas").css("display", "none");
        $("#face_video").css("display", "none");
        });

        function log(node_name, msg) {
        $(node_name).append("<span>" + msg + "</span><br />")
        }

        // Function executes when Start button is pushed.
        function onStart() {
        if (detector && !detector.isRunning) {
            $("#logs").html("");
            detector.start();
        }
        }

        // Function executes when Stop button is pushed
        function onStop() {
        if (detector && detector.isRunning) {
            detector.removeEventListener();
            console.log("PAUSA RECONOCIMIENTO");
            detector.stop();

        }
        };

        // Function executes when Reset button is pushed
        function onReset() {
        if (detector && detector.isRunning) {
            detector.reset();

            $('#results').html("");
        }
        };

        // Checks for Webcam access
        detector.addEventListener("onWebcamConnectSuccess", function () {
        });

        // Inform in console if fails
        detector.addEventListener("onWebcamConnectFailure", function () {
        console.log("Webcam access denied");
        });

        // se notifica que se paro con el reconocimiento
        detector.addEventListener("onStopSuccess", function () {

        $("#results").html("");
        });


        // se sacan los resultados de la deteccion de la camara
        detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {
        if (reconocimiento == 1){
            $('#results').html("");
            if (faces.length > 0) {
            var appearance = JSON.stringify(faces[0].appearance)
            var emotions = JSON.stringify(faces[0].emotions, function (key, val) {
                return val.toFixed ? Number(val.toFixed(0)) : val;
            })
            var expressions = JSON.stringify(faces[0].expressions, function (key, val) {
                return val.toFixed ? Number(val.toFixed(0)) : val;
            })
            var types = JSON.parse(emotions);
            log('#results', "Emotions: " + emotions);
            getMood(types)
            drawFeaturePoints(image, faces[0].featurePoints);
            }
        }
        });

        //Dibuja los puntos de características faciales detectados en la imagen
        function drawFeaturePoints(img, featurePoints) {
        var contxt = $('#face_video_canvas')[0].getContext('2d');
        var hRatio = contxt.canvas.width / img.width;
        var vRatio = contxt.canvas.height / img.height;
        var ratio = Math.min(hRatio, vRatio);

        contxt.strokeStyle = "#FFFFFF";
        for (var id in featurePoints) {
            contxt.beginPath();
            contxt.arc(featurePoints[id].x,
            featurePoints[id].y, 2, 0, 2 * Math.PI);
            contxt.stroke();
        }
        }

        function getMood(types) {
        var joy = types.joy;
        var sadness = types.sadness;
        var disgust = types.disgust;
        var contempt = types.contempt;
        var anger = types.anger;
        var fear = types.fear;
        var surprise = types.surprise;
        var emotion;

        //Se inicializan las variables que se tendrán en cuenta para definir las emociones
        var suma = (joy + sadness + disgust + contempt + anger + fear + surprise)
        var felicidad = joy - sadness - disgust - anger
        var promedio1 = (suma - surprise) / 6
        var promedio2 = (suma - fear) / 6
        var promedio3 = (suma - disgust) / 6
        var promedio4 = (suma - sadness) / 6
        var promedio5 = (suma - anger) / 6
        var promedio6 = (suma - contempt) / 6

        if (suma < 8) {
            emotion = "neutral";
            neutral = neutral + 1;
        }

        else if ((felicidad > 0) || (surprise > promedio1) || (fear > promedio2)) {
            emotion = "entretenido";
            entretenido = entretenido + 5;
        }

        else if ((disgust > promedio3) || (sadness > promedio4) || (anger > promedio5) || (contempt > promedio6)) {
            emotion = "aburrido"
            aburrido = aburrido + 5;
        }

        log('#results', "Humor: " + emotion);
        //Se envia la emocion por ajax a un archivo en php el cual realiza un INSERT en la base de datos
        Consulta();
        }


        function vidplay() {
        var video = document.getElementById("video");
        var button = document.getElementById("play");
        var tiempoTotal = video.duration;
        console.log(tiempoTotal);

        if (video.paused) {
            video.play();
            console.log("SE REINICIÓ EL VIDEO");
            reconocimiento = 1;

        }
        else {
            video.pause();
            console.log("SE PAUSÓ EL VIDEO");
            var tiempo = video.currentTime;
            reconocimiento = 0;
            //console.log(tiempo);
        }

        }

        //Envio datos
        function Consulta() {
        var video = document.getElementById("video");
        var tiempoTotal = video.duration;
        var tiempoActual = video.currentTime;
        //var tmp = parseInt(tiempoTotal - 179);
        var tmp = 20;
        var Actual = parseInt (tiempoActual);
        if(Actual == tmp){
            variable = 1;
        }

        var emocionMax = 0;
        var idEmocion = 0;
        var idUser = <?php echo''.$idUser.''; ?>;
        var idVideo = <?php echo''.$idVideo_temp.''; ?>;
        var categoria = "teorico";
        document.getElementsByName("categoria").value = categoria;
        var emocion = 0;


        if (aburrido > emocionMax) {
            emocionMax = aburrido;
            emocion = "aburrido";
        }

        if (entretenido > emocionMax) {
            emocionMax = entretenido;
            emocion = "entretenido";
        }
        
        if (neutral > emocionMax) {
            emocionMax = neutral;
            emocion = "neutral";
        }

        log('#results', "emocion: " + emocion);
        log('#results', "aburrido: " + aburrido);
        log('#results', "entretenido: " + entretenido);
        log('#results', "neutral: " + neutral);



        if (Actual > tmp && variable == 1) {
            console.log("TIEMPO = PASARON 20s")
            $.ajax({
            url: 'http://localhost:8080/enfasisTM4_v3/DataBase/AddEmotion.php?idEmocion=' + idEmocion + '&idUser=' + idUser + ',&idVideo=' + idVideo + ',&categoria=' + categoria + '&emocion=' + emocion,
            type: 'post',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: { idEmocion, idUser, idVideo, categoria, emocion },
            complete: function (rData) {
            }
            });
        variable = 0;
        }

        }

