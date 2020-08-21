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

var named = require('fuge-named')


/**
 * lightweight dns server for fuge
 */
module.exports = function (opts, store) {
  var server

  function start (cb) {
    server = named.createServer()

    server.listen(opts.port, opts.host, function () {
      server.on('query', function (query) {
        var record = store.lookupRecord(query.type(), query.name())

        if (record) {
          if (record.length) {
            for (let ans of record) {
              query.addAnswer(query.name(), ans)
            }
          } else {
            query.addAnswer(query.name(), record)
          }
        }
        server.send(query)
      })
      cb()
    })
  }



  function stop (cb) {
    server.close(cb)
  }



  return {
    start: start,
    stop: stop
  }
}

