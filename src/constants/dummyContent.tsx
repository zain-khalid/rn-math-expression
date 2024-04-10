const dummyContent = `
"That's okay, Olufemi! Let's work through the simplification together. 

When we look at the first part of the expression, $\\int \\frac{x^2 + 25}{\\sqrt{x^2 + 25}} dx$$, we notice that the numerator is essentially the same as what's inside the square root in the denominator, just without the square root. This means we can simplify this part of the integral significantly.

The square root of $x^2 + 25", "$$ in the denominator and the $x^2 + 25$$", " in the numerator essentially cancel out, leaving us with:
\\[
\\int dx - \\int \\frac{25}{\\sqrt{x^2 + 25}} dx
\\]

The first term, $\\int dx", "$$, is straightforward to integrate. It simply represents the integral of $1$$", " with respect to $x", "$$, which is $x$$", ". 

Now, for the second term, $\\int \\frac{25}{\\sqrt{x^2 + 25}} dx$$, it looks a bit more complex due to the square root in the denominator. However, this is a standard form that can be approached with trigonometric substitution or by recognizing it as a derivative of a known function. 

Before we tackle the second term, do you understand how we simplified the first part and why $\\int dx", "$$ equals $x$$", "?"
`;

export {
    dummyContent
}