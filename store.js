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

var named = require('node-named')


/**
 * in memory record store for fuge dns
 */
module.exports = function (opts) {
  var records = {A: {}, SRV: {}}


  function addARecord (domain, address) {
    records.A[domain] = new named.ARecord(address, opts.ttl)
  }



  function addSRVRecord (domain, address, port, options) {
    records.SRV[domain] = new named.SRVRecord(address, port, options)
  }



  function lookupRecord (type, domain) {
    var result

    if (records[type] && records[type][domain]) {
      result = records[type][domain]
    } else {
      result = null
    }
    return result
  }



  function removeAllRecords () {
    records.A = {}
    records.SRV = {}
  }



  return {
    addARecord: addARecord,
    addSRVRecord: addSRVRecord,
    removeAllRecords: removeAllRecords,
    lookupRecord: lookupRecord
  }
}

