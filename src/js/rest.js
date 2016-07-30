/*global Framework7, Dom7 */

(function (Framework7, $$) {
	'use strict';

	var urls = [
		'http://192.168.1.44:9292/'
	], req, rest;

	req = function (path, success, error, retry) {
		retry = retry || 0;
		return $$.ajax({
			url: urls[retry % urls.length] + path,
			success: success,
			error: function (xhr) {
				if (retry < urls.length - 1) {
					req(path, success, error, retry += 1);
				} else {
					error(xhr);
				}
			}
		});
	};

	rest = {

		urls: urls,

		fetch_device: function (id, success, error) {
			return req('devices/' + id + '.json', success, error);
		},

		fetch_devices_list: function (success, error) {
			return req('devices.json', success, error);
		}
  };

	window.rest = rest;

}(Framework7, Dom7));
