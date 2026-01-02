const Router = require("express");
const router = Router();
const uptime = Date.now() / 1000;
const si = require('systeminformation');

const keepalive  = async (req, res) => {return res.send({
    uptime: uptime,
    version: "Wan-v2"
})}

const stat = async (req, res) => {
    try {
        const cpuLoad = await si.currentLoad();
        const mem = await si.mem();
    
        res.json({
          vcpu: process.env.VCPU_LIMIT || cpuLoad.cpus.length,
          cpuUsage: cpuLoad.currentLoad.toFixed(2),
          freeRAM: (mem.available / 1024 / 1024).toFixed(2),
          totalRAM: process.env.RAM_LIMIT_MB || (mem.total / 1024 / 1024).toFixed(2),
        });
      } catch (err) {
        res.status(500).json({ error: 'System stat failed', details: err });
      }
}

router.head("/keepalive", keepalive)
router.get("/keepalive", keepalive)
router.get("/stat", stat)

module.exports = router;