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
var dns = require('../index')({host: '127.0.0.1', port: 53054, ttl: 60})

describe('A and SRV query', () => {
  before((done) => {
    dns.addARecord('test.local', '1.2.3.4')
    dns.addSRVRecord('_http.test.local', '1.2.3.4', 8080)
    dns.start(done)
  })

  after(() => {
    dns.stop()
    dns.removeAllRecords()
  })

  it('success A and SRV query', () => {
    var client = dnsSocket()

    client.query({questions: [{type: 'A', name: 'test.local'}]}, 53054, '127.0.0.1', function (err, res) {
      expect(err).to.be.null
      expect(res.answers[0].data).to.equal('1.2.3.4', 'check A record address')
      client.query({questions: [{type: 'SRV', name: '_http.test.local'}]}, 53054, '127.0.0.1', function (err, res) {
        client.destroy()
        expect(err).to.be.null
        expect(res.answers[0].data.target).equal('1.2.3.4', 'check SRV target')
        expect(res.answers[0].data.port).equal(8080, 'check SRV port')
        expect(res.answers[0].data.weight).equal(10, 'check SRV weight')
        expect(res.answers[0].data.priority).equal(0, 'check SRV priority')
      })
    })
  })


  it('fail A query', () => {
    var client = dnsSocket()

    client.query({questions: [{type: 'A', name: 'wibble.fish'}]}, 53054, '127.0.0.1', function (err, res) {
      expect(err).to.be.null
      expect(res.answers.length).equal(0, 'check no answer')
      client.destroy()
    })
  })


  // test('no opts', function (t) {
  //   t.plan(1)
  //   require('../index')()
  //   t.pass()
  // })
})
