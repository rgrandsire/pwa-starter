    window.onload = function () 
        {
            checkingForPort();
            connectToPort();
        }

        let port = null;
        let textDecoder;
        let readableStreamClosed;
        let reader;
        let zSend = "";
        let swap = false;
        let posNum = true;
        

        async function connectToPort()
        
        {
            console.log("Trying to get the ports");
            const zButton = document.getElementById('doConnect');
            try {
                    zButton.addEventListener ('click', async () => 
                    {   
                        
                        console.log("Requesting ports");
                        port = await navigator.serial.requestPort();
                        try {
                        console.log("Connect Button clicked");
                        await port.open({ baudRate: 9600});
                        //console.log(port.message);
                        } catch (zEx) {
                            console.log("Error reconnecting: " + zEx.message);
                            document.getElementById("zText1").innerHTML= zEx.message;
                        };
                        document.getElementById('Test').innerHTML = "Connected";
                        let stuff = 0;
                        document.getElementById("Test").style.color = "green";
                        ////// Disable to connect bnutton
                        let btn = document.getElementById("doConnect");
                        btn.disabled = true;
                        btn = document.getElementById("disConnect");
                        btn.disabled = false;
                   
                       
                        while (port.readable) {

                            textDecoder = new TextDecoderStream();
                            readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
                            reader = textDecoder.readable.getReader();
                            // Listen to data coming from the serial device.
                            let received="";
                            let start = 0;
                            let stop = 0;
                            while (true) 
                            {
                                let { value, done } = await reader.read();
                                if (done) 
                                {
                                    reader.releaseLock();
                                    break;
                                }
                            received += value;  
                            console.log("Received: " + received);
                            document.getElementById("zReceive").innerHTML+= received;
                            
                            //************************************************************************************************* */
                            // Remove M or I from the received string --> Use Regex
                            received = SetString(received);

                            // Remove and new line characters
                            RemoveCRLF();

                            // Always send a positive number
                            posNum =  document.getElementById('positiveNum').checked;
                            if (posNum == true)
                            {
                                AlwaysPositive();
                            }
                            
                            // Swap the result and the device ID
                            swap =   document.getElementById('splitSwap').checked;
                            console.log('Swap Checked: ' + swap);
                            if (swap == true)
                            {
                                SplitSwap();
                            }


                            // Displaying the result            
                            document.getElementById("zWrite").innerHTML+= zSend;

                            // Clear the buffer
                            received = "";
                            value = "";
                        }
                    }

                });
            }
            catch (ex)
            {
                console.log(ex.message);
                document.getElementById("zReceive").innerHTML = ex.message;
                document.getElementById.style.color = "red";
            }    
                  
        }
                     
        function checkingForPort()
        {
            if ("serial" in navigator) 
            {
                let zElement = document.getElementById('Test');
                zElement.style.color = "green";
                zElement.innerHTML = "The serial port is accessible from your browser";
                console.log("serial port OK");
            } else
            {
                alert("Your browser does not support serial port access");
            }
        }

        function SetString(zRec)
        {
            // Remove the last char I or M
            console.log("Removing MM or IN")
            zSend = zRec.replace('M','');
            zSend = zSend.replace('I','');            
        }

        function RemoveCRLF()
        {
            console.log("Removing CR/LF");
            zSend = zSend.replace('\n', '');
            zSend = zSend.replace('\r','');
        }

        function AlwaysPositive()
        {
            console.log("always send Abs number");
            zSend = zSend.replace("-", "+");
        }

        function SplitSwap()
        {
            const zArr = zSend.split('+');
            zSend = zArr[1] + '+' + zArr[0];
            console.log('New String: ' + zSend);
        }

        async function Disconnect()
        {
        reader.cancel();
        await readableStreamClosed.catch(() => {  });
        await  port.close(function (err) {
            console.log('port closed', err);
        });
            document.getElementById('Test').style.color = "red";
            document.getElementById('Test').innerHTML = "Disconnected";
            let btn = document.getElementById("doConnect");
            btn.disabled = false;
            btn = document.getElementById("disConnect");
            btn.disabled = true;
        }
