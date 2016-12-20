/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict'

var test = require('tap').test
var dnsSocket = require('dns-socket')
var dns = require('../index')({host: '127.0.0.1', port: 53053, ttl: 60})

var configZone = {
  'A': {
    'frontend.testns.svc.cluster.local': {
      'address': '127.0.0.1'
    },
    'service.testns.svc.cluster.local': {
      'address': '127.0.0.1'
    }
  },
  'SRV': {
    '_main._tcp.frontend.testns.svc.cluster.local': {
      'address': '127.0.0.1',
      'port': '3000'
    },
    '_tcp._tcp.frontend.testns.svc.cluster.local': {
      'address': '127.0.0.1',
      'port': '3001'
    },
    '_http._tcp.service.testns.svc.cluster.local': {
      'address': '127.0.0.1',
      'port': '20000'
    }
  }
}


test('A and SRV query from config spinup', function (t) {
  t.plan(7)

  dns.addZone(configZone)
  dns.start(function () {
    var client = dnsSocket()

    client.query({questions: [{type: 'A', name: 'frontend.testns.svc.cluster.local'}]}, 53053, '127.0.0.1', function (err, res) {
      t.equal(err, null, 'check err is null')
      t.equal(res.answers[0].data, '127.0.0.1', 'check A record address')
      client.query({questions: [{type: 'SRV', name: '_http._tcp.service.testns.svc.cluster.local'}]}, 53053, '127.0.0.1', function (err, res) {
        client.destroy()
        dns.stop()
        dns.removeAllRecords()
        t.equal(err, null, 'check err is null')
        t.equal(res.answers[0].data.target, '127.0.0.1', 'check SRV target')
        t.equal(res.answers[0].data.port, 20000, 'check SRV port')
        t.equal(res.answers[0].data.weight, 10, 'check SRV weight')
        t.equal(res.answers[0].data.priority, 0, 'check SRV priority')
      })
    })
  })
})

