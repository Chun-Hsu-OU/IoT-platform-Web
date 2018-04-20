$(document).ready(function(){
	window.draw=function(data) {
			var obj = JSON.parse(data);
			/*var correct;
			var dateTime = new Date(obj.dataList[1].timestamp);
			correct = dateTime.toLocaleString();
			console.log(correct);*/
			
			/*sorting data by timestamp*/
			obj.dataList.sort(function(x,y){
				date1 = new Date(x.timestamp);
				date2 = new Date(y.timestamp);
				return date1 - date2 ;
			});
			
			var time = [];
			var humi = [];
			for(var j in obj.dataList) {
				obj.dataList[j].timestamp *= 1000;
				var dateTime = new Date(obj.dataList[j].timestamp);
				obj.dataList[j].timestamp = dateTime.toLocaleString();
			}
			for(var i in obj.dataList) {
				time.push(obj.dataList[i].timestamp);
				humi.push(obj.dataList[i].value);
			}

			var chartdata = {
				labels: time,
				datasets : [
					{
						label: "Soil Temperature",
						backgroundColor: "rgba(150, 202, 89, 0.12)",
						borderColor: "rgba(150, 202, 89, 0.9)",
						pointBorderColor: "rgba(150, 202, 89, 0.9)",
						pointBackgroundColor: "rgba(0, 0, 0, 0.0)",
						pointHoverBackgroundColor: "#fff",
						pointHoverBorderColor: "rgba(220,220,220,1)",
						pointBorderWidth: 3,
						pointRadius: 5,
						data: humi
					}
				]
			};

			var ctx = $("#temp_canvas");

			var barGraph = new Chart(ctx, {
				type: 'line',
				data: chartdata,
				options: {
					elements: {
						line: {
							tension: 0, // disables bezier curves
						}
					}
				}
				
			});
		}
}); 