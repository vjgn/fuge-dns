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

var assert = require('assert')


/**
 * lightweight dns server for fuge
 */
module.exports = function (opts) {
  opts = opts || {}
  opts.ttl = opts.ttl || 60
  opts.host = opts.host || '127.0.0.1'
  opts.port = opts.port || 53
  var store = require('./store')(opts)
  var server = require('./server')(opts, store)


  /**
   * add records from fuge config file, uses a block of JSON of the fllowing format
   *{
   *  "A": {
   *    "frontend.testns.svc.cluster.local": {
   *      "address": "127.0.0.1"
   *    }...
   *  }...
   *  "SRV": {
   *    "_http._tcp.frontend.testns.svc.cluster.local": {
   *      "address": "127.0.0.1",
   *      "port": "3000"
   *  }...
   * }
   */
  function addZone (zone) {
    assert(zone.A && zone.SRV)

    Object.keys(zone).forEach(function (type) {
      Object.keys(zone[type]).forEach(function (record) {
        if (type === 'A') {
          store.addARecord(record, zone[type][record].address)
        }
        if (type === 'SRV') {
          store.addSRVRecord(record, zone[type][record].cname, zone[type][record].port)
        }
      })
    })
  }


  return {
    addZone: addZone,
    addARecord: store.addARecord,
    addSRVRecord: store.addSRVRecord,
    listRecords: store.listRecords,
    removeAllRecords: store.removeAllRecords,
    start: server.start,
    stop: server.stop
  }
}

