const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Nikitha@0904",
    database: "demand"
});



// app.post('/login', (req, res) => {
//     const { email, password, role_id } = req.body;
//     const sql = "SELECT * FROM users WHERE email = ? AND password = ? ";
    
//     db.query(sql, [email, password, role_id], (err, data) => {
//         if(err) return res.json("Error");
//         if(data.length > 0) {
//             const userId = data[0].id;
//             const name = data[0].name;
//             const college_id = data[0].college_id;
//             const role_id = data[0].role_id;
//             return res.json({ message: "Login Successfully", userId, name , college_id, role_id});
            
//         } else {
//             return res.json("No record");
//         }
//     });
// });
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, data) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (data.length > 0) {
            const user = data[0];

            bcrypt.compare(password, user.password, (err, result) => {
                if (err) return res.status(500).json({ error: "Error comparing passwords" });

                if (result) {
                    const userId = user.id;
                    const name = user.name;
                    const college_id = user.college_id;
                    const role_id = user.role_id;

                    return res.json({ message: "Login Successfully", userId, name, college_id, role_id });
                } else {
                    return res.status(401).json({ error: "Incorrect password" });
                }
            });
        } else {
            return res.status(404).json({ error: "No record found" });
        }
    });
});


app.get('/dashboard/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `
        SELECT 
            COUNT(*) AS totalRequests,
            SUM(status = 'Approved') AS approvedRequests,
            SUM(status = 'Rejected') AS rejectedRequests,
            SUM(status = 'Pending' OR status = 'approved by office') AS pendingRequests
        FROM requests
        WHERE id = ?`;

    db.query(sql, userId, (err, data) => {
        if (err) {
            console.error('Error fetching dashboard data:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json({ error: "No data found for this user" });
        }
    });
});


app.get('/pending-requests/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT requests.*, college.college_name 
    FROM requests
    JOIN college ON requests.college_id = college.college_id
    WHERE id = ? AND (status = 'Pending' OR status = 'approved by office')
    ORDER BY request_timestamp DESC`; 

    db.query(sql, userId, (err, data) => {
        if (err) {
            console.error('Error fetching pending requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No pending requests found for this user" });
        }
    });
});


app.get('/approved-requests/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT requests.*,college.college_name 
    FROM requests
    JOIN college ON requests.college_id = college.college_id
     WHERE id = ? AND status = 'Approved'`;

    db.query(sql, userId, (err, data) => {
        if (err) {
            console.error('Error fetching approved requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No approved requests found for this user" });
        }
    });
});

app.get('/rejected-requests/:userId', (req, res) => {
    const userId = req.params.userId;
    const sql = `SELECT requests.*,college.college_name 
    FROM requests
    JOIN college ON requests.college_id = college.college_id
     WHERE id = ? AND status = 'Rejected'`;

    db.query(sql, userId, (err, data) => {
        if (err) {
            console.error('Error fetching rejected requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No rejected requests found for this user" });
        }
    });
});



app.get('/colleges', (req, res) => {
    
    const sql = "SELECT college_name FROM college WHERE college_name != 'Admin'";

    
    db.query(sql, (err, data) => {
        if (err) {
            console.error("Error fetching colleges:", err);
            return res.status(500).json({ error: "An error occurred while fetching colleges" });
        }
        
        res.json(data);
    });
});

app.post('/requests', (req, res) => {
    const formData = req.body;

    const sql = 'INSERT INTO requests SET ?';
    db.query(sql, formData, (err, result) => {
        if (err) {
            console.error('Error inserting into requests table:', err);
            res.status(500).json({ error: 'Error inserting into requests table' });
        } else {
            console.log('Form data inserted into requests table');
            res.status(200).json({ message: 'Form data inserted successfully' });
        }
    });
});



app.get('/request-details/:requestId',(req, res) => {
    const request_id = req.params.requestId;
    const sql = `
        SELECT r.*, u.name AS username, c.college_name as college_name FROM requests r JOIN users u ON r.id = u.id
        JOIN college c ON r.college_id = c.college_id
        WHERE r.request_id = ?
      `;
      db.query(sql, request_id, (err, data) => {
        if (err) {
            console.error('Error fetching rejected requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json(data);
    
    });
});


app.get('/officedashboard/:college_id', (req, res) => {
    const college_id = req.params.college_id;
    const sql = `
        SELECT 
            COUNT(*) AS totalRequests,
            SUM(status = 'Approved') AS approvedRequests,
            SUM(status = 'Rejected') AS rejectedRequests,
            SUM(status = 'Pending' OR status = 'approved by office') AS pendingRequests
        FROM requests
        WHERE college_id = ?`;

    db.query(sql, college_id, (err, data) => {
        if (err) {
            console.error('Error fetching dashboard data:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json({ error: "No data found for this user" });
        }
    });
});

app.put('/update-request-status/:request_id', (req, res) => {
    const requestId = req.params.request_id;
    const { status } = req.body;

    const sql = 'UPDATE requests SET status = ? WHERE request_id = ?';

    db.query(sql, [status, requestId], (err, result) => {
        if (err) {
            console.error('Error updating request status:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Request status updated successfully' });
        } else {
            res.status(404).json({ error: 'Request not found' });
        }
    });
});

app.put('/update-reject-status/:request_id', (req, res) => {
    const requestId = req.params.request_id;
    const { status, reason } = req.body;

    const sql = 'UPDATE requests SET status = ?, reason = ? WHERE request_id = ?';

    db.query(sql, [status, reason, requestId], (err, result) => {
        if (err) {
            console.error('Error updating request status:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (result.affectedRows === 1) {
            res.status(200).json({ message: 'Request status updated successfully' });
        } else {
            res.status(404).json({ error: 'Request not found' });
        }
    });
});



app.get('/officepending-requests/:college_id', (req, res) => {
    const college_id = req.params.college_id;
  
    const sql = `SELECT requests.*, users.name AS Username, college.college_name 
    FROM requests
    JOIN users ON requests.id = users.id
    JOIN college ON requests.college_id = college.college_id
     WHERE requests.college_id = ? AND (status = 'Pending' OR status = 'approved by office')`;

    db.query(sql, college_id, (err, data) => {
        if (err) {
            console.error('Error fetching pending requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No pending requests found for this user" });
        }
    });
});
        

app.get('/officeapproved-requests/:college_id', (req, res) => {
    const college_id = req.params.college_id;
    const sql = `SELECT requests.*, users.name AS Username, college.college_name 
    FROM requests
    JOIN users ON requests.id = users.id
    JOIN college ON requests.college_id = college.college_id
     WHERE requests.college_id = ? AND status = 'Approved'`;

    db.query(sql, college_id, (err, data) => {
        if (err) {
            console.error('Error fetching approved requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No approved requests found for this user" });
        }
    });
});

app.get('/officerejected-requests/:college_id', (req, res) => {
    const college_id = req.params.college_id;
    const sql = `SELECT requests.*, users.name AS Username, college.college_name 
    FROM requests
    JOIN users ON requests.id = users.id
    JOIN college ON requests.college_id = college.college_id
    WHERE college.college_id= ? AND status = 'Rejected'`;

    db.query(sql, college_id, (err, data) => {
        if (err) {
            console.error('Error fetching rejected requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No rejected requests found for this user" });
        }
    });
});

app.get('/adminDashboard', (req, res) => {
    const sql = `
        SELECT 
            COUNT(*) AS totalRequests,
            SUM(status = 'Approved') AS approvedRequests,
            SUM(status = 'Rejected') AS rejectedRequests,
            SUM(status = 'approved by office' ) AS pendingRequests
        FROM requests`;

    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching dashboard data:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json({ error: "No data found for this user" });
        }
    });
});

app.get('/adminpending-requests', (req, res) => {
  
    const sql = `SELECT requests.*, users.name AS Username, college.college_name 
    FROM requests
    JOIN users ON requests.id = users.id
    JOIN college ON requests.college_id = college.college_id
    WHERE requests.status = 'approved by office'`;

    db.query(sql,(err, data) => {
        if (err) {
            console.error('Error fetching pending requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No pending requests found for this user" });
        }
    });
});

app.get('/adminapproved-requests', (req, res) => {
    const sql = `SELECT requests.*, users.name AS Username, college.college_name 
    FROM requests
    JOIN users ON requests.id = users.id
    JOIN college ON requests.college_id = college.college_id
    WHERE requests.status = 'approved'`;

    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching approved requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No approved requests found for this user" });
        }
    });
});

app.get('/adminrejected-requests', (req, res) => {
    const sql = `SELECT requests.*, users.name AS Username, college.college_name 
    FROM requests
    JOIN users ON requests.id = users.id
    JOIN college ON requests.college_id = college.college_id
    WHERE requests.status = 'rejected'`;

    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching approved requests:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        if (data.length > 0) {
            return res.json(data);
        } else {
            return res.status(404).json({ error: "No approved requests found for this user" });
        }
    });
});

app.get('/vehicles/:request_id', (req, res) => {
    const request_id = req.params.request_id;

    const dateQuery = `SELECT date, vehicle_reporting_time
                       FROM requests
                       WHERE request_id = ${request_id}`;

    db.query(dateQuery, (dateErr, dateResult) => {
        if (dateErr) {
            console.error('Error fetching date:', dateErr);
            res.status(500).json({ error: 'An error occurred while fetching date' });
            return;
        }

        const currentDate = dateResult[0].date;
        const currentTime = dateResult[0].vehicle_reporting_time;
        console.log(currentDate);
        console.log(currentTime);

        const sql = `SELECT *
                     FROM vehicle 
                     WHERE vehicle.vehicle_id NOT IN (
                         SELECT vehicle_allocation.vehicle_id
                         FROM vehicle_allocation 
                         JOIN requests ON vehicle_allocation.request_id = requests.request_id
                         WHERE requests.date = '${currentDate}' 
                           AND (
                               ('${currentTime}' >= requests.vehicle_reporting_time AND '${currentTime}' <= requests.return_time)
                               OR ('${currentTime}' <= requests.vehicle_reporting_time AND '${currentTime}' <= requests.return_time)
                           )
                     )`;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching vehicles:', err);
                res.status(500).json({ error: 'An error occurred while fetching vehicles' });
                return;
            }
            return res.json(results);
        });
    });
});


app.get('/drivers/:request_id', (req, res) => {
    const request_id = req.params.request_id;


    const dateQuery = `SELECT date, vehicle_reporting_time
                       FROM requests
                       WHERE request_id = ${request_id}`;

    db.query(dateQuery, (dateErr, dateResult) => {
        if (dateErr) {
            console.error('Error fetching date:', dateErr);
            res.status(500).json({ error: 'An error occurred while fetching date' });
            return;
        }

        const currentDate = dateResult[0].date;
        const currentTime = dateResult[0].vehicle_reporting_time;
        console.log(currentDate);
        console.log(currentTime);

        const sql = `SELECT *
                     FROM drivers 
                     WHERE driver_id NOT IN (
                         SELECT driver_id
                         FROM vehicle_allocation 
                         JOIN requests ON vehicle_allocation.request_id = requests.request_id
                         WHERE requests.date = '${currentDate}' 
                           AND (
                               ('${currentTime}' >= requests.vehicle_reporting_time AND '${currentTime}' <= requests.return_time)
                               OR ('${currentTime}' <= requests.vehicle_reporting_time AND '${currentTime}' <= requests.return_time)
                           )
                     )`;

        db.query(sql, (err, results) => {
            if (err) {
                console.error('Error fetching drivers:', err);
                res.status(500).json({ error: 'An error occurred while fetching drivers' });
                return;
            }
            return res.json(results);
        });
    });
});



app.post('/allocate-vehicle-driver', (req, res) => {
    const { requestId, driverId, vehicleId, status } = req.body;
  
    const allocationQuery = 'INSERT INTO vehicle_allocation (request_id, driver_id, vehicle_id, status) VALUES (?, ?, ?, ?)';
    db.query(allocationQuery, [requestId, driverId, vehicleId, status], (err, result) => {
      if (err) {
        console.error('Error allocating vehicle and driver:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      console.log('Allocation successful');
      return res.status(200).json({ message: 'Allocation successful' });
    });
  });  


app.get('/vehicles', (req, res) => {
    const sql = 'SELECT * FROM vehicle';
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching vehicles:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json(data);
    });
});

app.get('/drivers', (req, res) => {
    const sql = 'SELECT * FROM drivers';
    db.query(sql, (err, data) => {
        if (err) {
            console.error('Error fetching drivers:', err);
            return res.status(500).json({ error: "Internal server error" });
        }
        return res.json(data);
    });
});


app.post('/addDriver', (req, res) => {
    const { driver_id, driver_name, contact_no } = req.body;

    const sql = `INSERT INTO drivers (driver_id, driver_name, contact_no) VALUES (?, ?, ?)`;
    const values = [driver_id, driver_name, contact_no];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Error adding driver');
            return;
        }
        console.log('Driver added:', result);
        res.status(200).send('Driver added successfully');
    });
});

app.delete('/deleteDriver/:id', (req, res) => {
    const driverId = req.params.id;

    const sql = `DELETE FROM drivers WHERE driver_id = ?`;
    const values = [driverId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Error deleting driver');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Driver not found');
            return;
        }
        console.log('Driver deleted:', result);
        res.status(200).send('Driver deleted successfully');
    });
});

app.post('/addVehicle', (req, res) => {
    const { vehicle_no } = req.body;

    const sql = `INSERT INTO vehicle (vehicle_no) VALUES (?)`;
    const values = [vehicle_no];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Error adding vehicle');
            return;
        }
        console.log('Vehicle added:', result);
        res.status(200).send('Vehicle added successfully');
    });
});

app.delete('/deleteVehicle/:id', (req, res) => {
    const vehicleId = req.params.id;

    const sql =` DELETE FROM vehicle WHERE vehicle_id = ?`;
    const values = [vehicleId];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Error deleting vehicle');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Vehicle not found');
            return;
        }
        console.log('Vehicle deleted:', result);
        res.status(200).send('Vehicle deleted successfully');
    });
});




  

app.listen(8081, () => {
    console.log("Listening on port 8081....");
});
