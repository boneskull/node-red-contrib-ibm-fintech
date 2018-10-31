import * as utils from '../../src/lib/utils';

describe('utils', function() {
  describe('inspect()', function() {
    it('should return the first string', function() {
      const data = {bar: 'baz'};
      expect(utils.inspect`foo: ${data}`, 'to match', /^foo/);
    });

    it('should dump the expression', function() {
      const data = {bar: 'baz'};
      expect(utils.inspect`foo: ${data}`, 'to match', /\{ bar: 'baz' \}$/);
    });

    it('should append a colon to the string', function() {
      const data = {bar: 'baz'};
      expect(utils.inspect`foo ${data}`, 'to match', /^foo:/);
    });

    it('should not add a second colon to the string', function() {
      const data = {bar: 'baz'};
      expect(utils.inspect`foo: ${data}`, 'not to match', /^foo::/);
    });
  });

  describe('normalizeString()', function() {
    describe('when given non-string parameter', function() {
      it('should return void', function() {
        expect(utils.normalizeString(), 'to be undefined');
      });
    });
    describe('when given an empty string parameter', function() {
      it('should return void', function() {
        expect(utils.normalizeString(''), 'to be undefined');
      });
    });
    describe('when given a non-empty string', function() {
      it('should trim leading/trailing whitespace', function() {
        expect(utils.normalizeString(' foo '), 'to be', 'foo');
      });
    });
  });

  describe('normalizeArray()', function() {
    it('should compact empty string values', function() {
      expect(utils.normalizeArray(['foo', '']), 'to equal', ['foo']);
    });

    it('should compact null values', function() {
      expect(utils.normalizeArray(['foo', null]), 'to equal', ['foo']);
    });

    it('should compact undefined values', function() {
      expect(utils.normalizeArray(['foo', undefined]), 'to equal', ['foo']);
    });

    it('should compact non-strings', function() {
      expect(utils.normalizeArray(['foo', {}]), 'to equal', ['foo']);
    });

    it('should trim non-empty strings therein', function() {
      expect(utils.normalizeArray(['foo', ' bar ']), 'to equal', [
        'foo',
        'bar'
      ]);
    });

    it('should return void if array would be empty', function() {
      expect(utils.normalizeArray([]), 'to be undefined');
    });
  });
});
