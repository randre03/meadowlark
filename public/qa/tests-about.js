/**
 * Created by randre03 on 8/24/14.
 */
suite('"About" Page Tests', function() {
    test('page should contain link to contact page', function() {
        assert($('a[href="/contact"]').length);
    });
});