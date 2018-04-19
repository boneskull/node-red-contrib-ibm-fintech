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
});
