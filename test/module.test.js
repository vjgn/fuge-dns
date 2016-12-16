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


test('A and SRV query', function (t) {
  t.plan(7)

  dns.addARecord('test.local', '1.2.3.4')
  dns.addSRVRecord('_http.test.local', '1.2.3.4', 8080)
  dns.start(function () {
    var client = dnsSocket()

    client.query({questions: [{type: 'A', name: 'test.local'}]}, 53053, '127.0.0.1', function (err, res) {
      t.equal(err, null, 'check err is null')
      t.equal(res.answers[0].data, '1.2.3.4', 'check A record address')
      client.query({questions: [{type: 'SRV', name: '_http.test.local'}]}, 53053, '127.0.0.1', function (err, res) {
        client.destroy()
        dns.stop()
        dns.removeAllRecords()
        t.equal(err, null, 'check err is null')
        t.equal(res.answers[0].data.target, '1.2.3.4', 'check SRV target')
        t.equal(res.answers[0].data.port, 8080, 'check SRV port')
        t.equal(res.answers[0].data.weight, 10, 'check SRV weight')
        t.equal(res.answers[0].data.priority, 0, 'check SRV priority')
      })
    })
  })
})


test('fail A query', function (t) {
  t.plan(2)

  dns.addARecord('test.local', '1.2.3.4')
  dns.addSRVRecord('_http.test.local', '1.2.3.4', 8080)
  dns.start(function () {
    var client = dnsSocket()

    client.query({questions: [{type: 'A', name: 'wibble.fish'}]}, 53053, '127.0.0.1', function (err, res) {
      t.equal(err, null, 'check err is null')
      t.equal(res.answers.length, 0, 'check no answer')
      client.destroy()
      dns.stop()
      dns.removeAllRecords()
    })
  })
})


test('no opts', function (t) {
  t.plan(1)
  require('../index')()
  t.pass()
})

