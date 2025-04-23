

    const barChartData = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Sales ($)',
            data: [3000, 4000, 5000, 6000, 7000],
            backgroundColor: '#FFC107',
            borderColor: '#fff',
            borderWidth: 1
        }]
    };

    const lineChartData = {
        labels: ['January', 'February', 'March', 'April', 'May'],
        datasets: [{
            label: 'Revenue Growth ($)',
            data: [1000, 2000, 3000, 4000, 5000],
            backgroundColor: 'rgb(234, 179, 16)',
            borderColor: '#FFC107',
            borderWidth: 2
        }]
    };

    
    window.onload = function () {
        new Chart(document.getElementById('barChart'), { type: 'bar', data: barChartData });
        new Chart(document.getElementById('lineChart'), { type: 'line', data: lineChartData });
       
    };


    function confirmLogout() {
        if (confirm("Are you sure you want to logout?")) {
            window.location.href = "logInpage.html";
        }
    }
