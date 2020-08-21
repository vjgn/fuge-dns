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

// 'use strict'

var expect = require('chai').expect
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
    '_main._tcp.frontend.testns.svc.cluster.local': [{
      'address': '127.0.0.1',
      'cname': 'frontend.testns.svc.cluster.local',
      'port': '3000'
    }],
    '_tcp._tcp.frontend.testns.svc.cluster.local': [{
      'address': '127.0.0.1',
      'cname': 'frontend.testns.svc.cluster.local',
      'port': '3001'
    }],
    '_http._tcp.service.testns.svc.cluster.local': [
      {
        'address': '127.0.0.1',
        'cname': 'service.testns.svc.cluster.local',
        'port': '20000'
      },
      {
        'address': '127.0.0.1',
        'cname': 'service.testns.svc.cluster.local',
        'port': '20001'
      }
    ]
  }
}

describe('A and SRV query from config spinup', () => {
  before((done) => {
    dns.addZone(configZone)
    dns.start(done)
  })

  after(() => {
    dns.stop()
    dns.removeAllRecords()
  })

  it('A and SRV query', async () => {
    var client = dnsSocket()

    client.queryAsync = function (questions) {
      return new Promise((resolve, reject) => {
        client.query(questions, 53053, 'localhost', function (err, result) {
          if (err) reject(err)
          else resolve(result)
        })
      })
    }

    let res = await client.queryAsync({questions: [{type: 'A', name: 'frontend.testns.svc.cluster.local'}]})
    expect(res.answers[0].data).equal('127.0.0.1', 'check A record address')
    res = await client.queryAsync({questions: [{type: 'SRV', name: '_main._tcp.frontend.testns.svc.cluster.local'}]})
    expect(res.answers[0].data.target).equal('frontend.testns.svc.cluster.local', 'check SRV target')
    expect(res.answers[0].data.port).equal(3000, 'check SRV port')
    expect(res.answers[0].data.weight).equal(10, 'check SRV weight')
    expect(res.answers[0].data.priority).equal(0, 'check SRV priority')
    res = await client.queryAsync({questions: [{type: 'SRV', name: '_http._tcp.service.testns.svc.cluster.local'}]})
    client.destroy()
    expect(res.answers[0].data.target).equal('service.testns.svc.cluster.local', 'check SRV target')
    expect(res.answers[0].data.port).equal(20000, 'check SRV port')
    expect(res.answers[0].data.weight).equal(10, 'check SRV weight')
    expect(res.answers[0].data.priority).equal(0, 'check SRV priority')
    expect(res.answers[1].data.target).equal('service.testns.svc.cluster.local', 'check SRV target')
    expect(res.answers[1].data.port).equal(20001, 'check SRV port')
    expect(res.answers[1].data.weight).equal(10, 'check SRV weight')
    expect(res.answers[1].data.priority).equal(0, 'check SRV priority')
  })

  it('list records', () => {
    var records = dns.listRecords()
    expect(records.length).equal(5, 'check correct number of records in zone')
  })
})
