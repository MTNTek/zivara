# User Journey Testing Guide - Zivara eCommerce Platform

**Purpose**: This document provides comprehensive test scenarios for end-to-end user journeys to verify the platform is production-ready.

---

## Test Environment Setup

### Prerequisites
- [ ] Database seeded with test data
- [ ] All environment variables configured
- [ ] Application running (development or staging)
- [ ] Test payment cards available (Stripe test mode)
- [ ] Email service configured (test mode)

### Test Accounts
```
Admin Account:
Email: admin@zivara.com
Password: Admin123!

Test Customer:
Email: customer@test.com
Password: Customer123!
```

---

## Journey 1: New Customer Registration & First Purchase

### Objective
Verify a new customer can register, browse products, add to cart, and complete checkout.

### Steps

#### 1.1 Registration
1. Navigate to homepage
2. Click "Register" or "Sign Up"
3. Fill in registration form:
   - Name: Test Customer
   - Email: newcustomer@test.com
   - Password: Test123!
4. Submit form
5. **Expected**: Welcome email received
6. **Expected**: Redirected to homepage or dashboard
7. **Expected**: User is logged in

#### 1.2 Browse Products
1. View homepage featured products
2. Click "Products" or "Shop"
3. **Expected**: Product grid displays with images
4. **Expected**: Pagination controls visible
5. Test filters:
   - Select a category
   - Set price range
   - Set minimum rating
6. **Expected**: Products filtered correctly
7. Test sorting:
   - Sort by price (low to high)
   - Sort by price (high to low)
   - Sort by rating
8. **Expected**: Products sorted correctly

#### 1.3 Product Search
1. Enter search term in search bar (e.g., "laptop")
2. **Expected**: Relevant products displayed
3. **Expected**: Search results highlighted
4. **Expected**: Results load within 500ms

#### 1.4 View Product Details
1. Click on a product
2. **Expected**: Product detail page loads
3. **Expected**: Product images displayed
4. **Expected**: Price, description, inventory status visible
5. **Expected**: Reviews section visible
6. **Expected**: Add to Cart button visible

#### 1.5 Add to Cart
1. Select quantity (e.g., 2)
2. Click "Add to Cart"
3. **Expected**: Success message displayed
4. **Expected**: Cart icon updates with item count
5. Click cart icon
6. **Expected**: Cart drawer/page opens
7. **Expected**: Product displayed with correct quantity and price

#### 1.6 Modify Cart
1. Update quantity of item
2. **Expected**: Total updates correctly
3. Add another product to cart
4. **Expected**: Both products in cart
5. Remove one product
6. **Expected**: Product removed, total updated

#### 1.7 Checkout
1. Click "Checkout" or "Proceed to Checkout"
2. **Expected**: Checkout page loads
3. Fill in shipping address:
   - Address Line 1: 123 Test St
   - City: Test City
   - State: CA
   - Postal Code: 12345
   - Country: United States
4. **Expected**: Address validation passes
5. Enter payment information (Stripe test card):
   - Card: 4242 4242 4242 4242
   - Expiry: 12/34
   - CVC: 123
6. Click "Place Order"
7. **Expected**: Order processing indicator
8. **Expected**: Order confirmation page displayed
9. **Expected**: Order number generated
10. **Expected**: Order confirmation email received

#### 1.8 View Order
1. Navigate to "My Orders" or "Order History"
2. **Expected**: New order displayed
3. Click on order
4. **Expected**: Order details page loads
5. **Expected**: Order items, total, shipping address displayed
6. **Expected**: Order status: "Pending" or "Processing"

### Success Criteria
- [ ] Registration successful
- [ ] Welcome email received
- [ ] Products browsable and searchable
- [ ] Cart operations work correctly
- [ ] Checkout completes successfully
- [ ] Order confirmation email received
- [ ] Order visible in order history

---

## Journey 2: Returning Customer Purchase

### Objective
Verify returning customer can log in and complete a purchase with saved information.

### Steps

#### 2.1 Login
1. Navigate to homepage
2. Click "Login" or "Sign In"
3. Enter credentials:
   - Email: customer@test.com
   - Password: Customer123!
4. Click "Sign In"
5. **Expected**: Redirected to homepage
6. **Expected**: User is logged in
7. **Expected**: User name displayed in header

#### 2.2 Browse and Add to Cart
1. Browse products
2. Add product to cart
3. **Expected**: Cart persists from previous session (if any)
4. **Expected**: New product added to cart

#### 2.3 Checkout with Saved Address
1. Proceed to checkout
2. **Expected**: Saved shipping address pre-filled
3. Option to use saved address or enter new one
4. Complete payment
5. **Expected**: Order placed successfully

### Success Criteria
- [ ] Login successful
- [ ] Cart persists across sessions
- [ ] Saved address available at checkout
- [ ] Order completes successfully

---

## Journey 3: Guest Checkout

### Objective
Verify guest users can purchase without creating an account.

### Steps

#### 3.1 Browse as Guest
1. Open homepage in incognito/private window
2. Browse products
3. Add product to cart
4. **Expected**: Cart stored in local storage

#### 3.2 Guest Checkout
1. Proceed to checkout
2. **Expected**: Prompted for email address
3. Enter guest email: guest@test.com
4. Fill in shipping address
5. Complete payment
6. **Expected**: Order placed successfully
7. **Expected**: Order confirmation email sent to guest email

#### 3.3 Guest Order Tracking
1. Check email for order tracking link
2. Click tracking link
3. **Expected**: Order status page loads without login
4. **Expected**: Order details visible

#### 3.4 Optional Account Creation
1. After checkout, check for account creation prompt
2. **Expected**: Option to create account offered
3. Create account
4. **Expected**: Order associated with new account

### Success Criteria
- [ ] Guest can browse and add to cart
- [ ] Guest checkout completes without account
- [ ] Order confirmation email received
- [ ] Guest order tracking works
- [ ] Optional account creation works

---

## Journey 4: Product Review Submission

### Objective
Verify customers can submit and manage product reviews.

### Steps

#### 4.1 Submit Review
1. Log in as customer who has purchased a product
2. Navigate to purchased product
3. **Expected**: "Write a Review" button visible
4. Click "Write a Review"
5. Fill in review form:
   - Rating: 5 stars
   - Comment: "Great product! Highly recommend."
6. Submit review
7. **Expected**: Review submitted successfully
8. **Expected**: Review appears on product page
9. **Expected**: Product average rating updated

#### 4.2 Edit Review
1. Navigate to product with your review
2. **Expected**: "Edit Review" option visible
3. Click "Edit Review"
4. Update rating to 4 stars
5. Update comment
6. Save changes
7. **Expected**: Review updated successfully
8. **Expected**: Product average rating recalculated

#### 4.3 Delete Review
1. Navigate to product with your review
2. **Expected**: "Delete Review" option visible
3. Click "Delete Review"
4. Confirm deletion
5. **Expected**: Review deleted
6. **Expected**: Product average rating recalculated

#### 4.4 Review Restrictions
1. Try to review a product not purchased
2. **Expected**: Error message or no review button
3. Try to submit multiple reviews for same product
4. **Expected**: Error message or edit existing review

### Success Criteria
- [ ] Review submission works
- [ ] Average rating calculates correctly
- [ ] Review editing works (within 30 days)
- [ ] Review deletion works
- [ ] Review restrictions enforced

---

## Journey 5: Admin Product Management

### Objective
Verify admin can manage products, categories, and inventory.

### Steps

#### 5.1 Admin Login
1. Navigate to /admin or /admin/dashboard
2. **Expected**: Redirected to login if not authenticated
3. Log in with admin credentials
4. **Expected**: Admin dashboard loads
5. **Expected**: Statistics displayed (orders, revenue, products)

#### 5.2 Create Product
1. Navigate to Products section
2. Click "Add Product" or "Create Product"
3. Fill in product form:
   - Name: Test Product
   - Description: Test description
   - Price: 99.99
   - Category: Select category
   - SKU: TEST-001
4. Upload product images
5. Set inventory quantity: 100
6. Click "Save" or "Create"
7. **Expected**: Product created successfully
8. **Expected**: Product appears in product list

#### 5.3 Edit Product
1. Find created product in list
2. Click "Edit"
3. Update product details
4. Click "Save"
5. **Expected**: Product updated successfully
6. **Expected**: Changes reflected on product page

#### 5.4 Manage Inventory
1. Navigate to product inventory
2. Update inventory quantity
3. **Expected**: Inventory updated
4. Set inventory to 0
5. **Expected**: Product marked as out of stock
6. **Expected**: Product not purchasable on frontend

#### 5.5 Create Category
1. Navigate to Categories section
2. Click "Add Category"
3. Fill in category form:
   - Name: Test Category
   - Slug: test-category
   - Parent: (optional)
4. Click "Save"
5. **Expected**: Category created
6. **Expected**: Category appears in category list

#### 5.6 Delete Product (Soft Delete)
1. Find product in list
2. Click "Delete" or "Deactivate"
3. Confirm deletion
4. **Expected**: Product marked as inactive
5. **Expected**: Product not visible on frontend
6. **Expected**: Product still in database (soft delete)

### Success Criteria
- [ ] Admin can access dashboard
- [ ] Product creation works
- [ ] Product editing works
- [ ] Inventory management works
- [ ] Category management works
- [ ] Soft delete works

---

## Journey 6: Admin Order Management

### Objective
Verify admin can view, filter, and manage orders.

### Steps

#### 6.1 View Orders
1. Log in as admin
2. Navigate to Orders section
3. **Expected**: List of all orders displayed
4. **Expected**: Order statistics visible

#### 6.2 Filter Orders
1. Filter by status (e.g., "Pending")
2. **Expected**: Only pending orders displayed
3. Filter by date range
4. **Expected**: Orders within date range displayed
5. Search by order number
6. **Expected**: Specific order found

#### 6.3 View Order Details
1. Click on an order
2. **Expected**: Order details page loads
3. **Expected**: Customer information displayed
4. **Expected**: Order items displayed
5. **Expected**: Shipping address displayed
6. **Expected**: Order status history displayed

#### 6.4 Update Order Status
1. On order details page, find status dropdown
2. Change status to "Processing"
3. Click "Update Status"
4. **Expected**: Status updated
5. **Expected**: Status change logged in history
6. **Expected**: Customer notified (if applicable)
7. Change status to "Shipped"
8. **Expected**: Shipping notification email sent

#### 6.5 Export Orders
1. Navigate to orders list
2. Click "Export" or "Download CSV"
3. **Expected**: CSV file downloaded
4. **Expected**: CSV contains order data

### Success Criteria
- [ ] Admin can view all orders
- [ ] Order filtering works
- [ ] Order search works
- [ ] Order details accessible
- [ ] Order status updates work
- [ ] Status change notifications sent
- [ ] Order export works

---

## Journey 7: Admin User Management

### Objective
Verify admin can manage user accounts.

### Steps

#### 7.1 View Users
1. Log in as admin
2. Navigate to Users section
3. **Expected**: List of all users displayed

#### 7.2 Search Users
1. Search by email or name
2. **Expected**: Matching users displayed

#### 7.3 View User Details
1. Click on a user
2. **Expected**: User details page loads
3. **Expected**: User information displayed
4. **Expected**: Order history displayed

#### 7.4 Deactivate User
1. On user details page, click "Deactivate"
2. Confirm deactivation
3. **Expected**: User account deactivated
4. **Expected**: User cannot log in
5. **Expected**: Action logged in audit log

#### 7.5 Reset User Password
1. On user details page, click "Reset Password"
2. **Expected**: Password reset email sent to user
3. **Expected**: Action logged in audit log

### Success Criteria
- [ ] Admin can view all users
- [ ] User search works
- [ ] User details accessible
- [ ] User deactivation works
- [ ] Password reset works
- [ ] Admin actions logged

---

## Journey 8: Profile Management

### Objective
Verify customers can manage their profile and addresses.

### Steps

#### 8.1 Update Profile
1. Log in as customer
2. Navigate to Profile or Account Settings
3. Update name
4. Update email
5. Click "Save"
6. **Expected**: Profile updated
7. **Expected**: Email verification sent (if email changed)

#### 8.2 Manage Addresses
1. Navigate to Addresses section
2. Click "Add Address"
3. Fill in address form
4. Click "Save"
5. **Expected**: Address added
6. **Expected**: Address appears in address list

#### 8.3 Set Default Address
1. Find address in list
2. Click "Set as Default"
3. **Expected**: Address marked as default
4. **Expected**: Default address used at checkout

#### 8.4 Edit Address
1. Click "Edit" on an address
2. Update address details
3. Click "Save"
4. **Expected**: Address updated

#### 8.5 Delete Address
1. Click "Delete" on an address
2. Confirm deletion
3. **Expected**: Address deleted
4. **Expected**: Address removed from list

### Success Criteria
- [ ] Profile updates work
- [ ] Email change verification works
- [ ] Address management works
- [ ] Default address setting works
- [ ] Maximum 5 addresses enforced

---

## Journey 9: Order Tracking

### Objective
Verify customers can track their orders.

### Steps

#### 9.1 View Order History
1. Log in as customer
2. Navigate to "My Orders"
3. **Expected**: List of orders displayed
4. **Expected**: Order status visible for each

#### 9.2 View Order Details
1. Click on an order
2. **Expected**: Order details page loads
3. **Expected**: Order items displayed
4. **Expected**: Order status timeline displayed
5. **Expected**: Shipping information displayed (if shipped)

#### 9.3 Cancel Order
1. Find order with "Pending" status
2. Click "Cancel Order"
3. Confirm cancellation
4. **Expected**: Order status changed to "Cancelled"
5. **Expected**: Inventory restored
6. **Expected**: Cancellation email sent

#### 9.4 Track Shipped Order
1. Find order with "Shipped" status
2. **Expected**: Tracking number displayed
3. **Expected**: Carrier name displayed
4. **Expected**: Estimated delivery date displayed

### Success Criteria
- [ ] Order history accessible
- [ ] Order details visible
- [ ] Order status timeline works
- [ ] Order cancellation works (pending only)
- [ ] Tracking information displayed

---

## Journey 10: Error Handling & Edge Cases

### Objective
Verify the platform handles errors and edge cases gracefully.

### Steps

#### 10.1 Invalid Login
1. Try to log in with incorrect password
2. **Expected**: Error message displayed
3. **Expected**: No sensitive information revealed
4. Try 5 times
5. **Expected**: Rate limit triggered
6. **Expected**: Temporary block message displayed

#### 10.2 Out of Stock Product
1. Find product with 0 inventory
2. **Expected**: "Out of Stock" message displayed
3. **Expected**: Add to Cart button disabled
4. Try to add to cart via API
5. **Expected**: Error message returned

#### 10.3 Insufficient Inventory
1. Add product to cart with quantity > available
2. **Expected**: Error message displayed
3. **Expected**: Maximum available quantity suggested

#### 10.4 Payment Failure
1. Proceed to checkout
2. Use Stripe test card for declined payment: 4000 0000 0000 0002
3. **Expected**: Payment declined message
4. **Expected**: Cart preserved
5. **Expected**: Can retry payment

#### 10.5 Session Expiration
1. Log in
2. Wait 24+ hours (or manually expire session)
3. Try to access protected page
4. **Expected**: Redirected to login
5. **Expected**: Message about session expiration

#### 10.6 Invalid Form Inputs
1. Try to submit forms with invalid data:
   - Invalid email format
   - Negative prices
   - Invalid rating (0 or 6)
2. **Expected**: Validation errors displayed
3. **Expected**: Form not submitted

### Success Criteria
- [ ] Invalid login handled gracefully
- [ ] Rate limiting works
- [ ] Out of stock prevention works
- [ ] Payment failures handled
- [ ] Session expiration handled
- [ ] Form validation works

---

## Performance Testing

### Page Load Times
- [ ] Homepage loads within 2 seconds
- [ ] Product listing loads within 2 seconds
- [ ] Product detail page loads within 1.5 seconds
- [ ] Cart page loads within 1 second
- [ ] Checkout page loads within 1.5 seconds

### Search Performance
- [ ] Search returns results within 500ms
- [ ] Search with filters returns results within 500ms
- [ ] Complex queries return results within 1 second

### Database Performance
- [ ] Product queries execute within 100ms
- [ ] Order queries execute within 100ms
- [ ] Cart operations execute within 50ms

---

## Mobile Testing

### Responsive Design
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet (iPad)
- [ ] All features work on mobile
- [ ] Touch targets are 44px minimum
- [ ] Navigation works (hamburger menu)
- [ ] Forms are usable on mobile
- [ ] Images load correctly
- [ ] Checkout works on mobile

---

## Browser Compatibility

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] Safari iOS (latest)
- [ ] Chrome Android (latest)
- [ ] Samsung Internet

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements accessible via keyboard
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] No keyboard traps

### Screen Reader
- [ ] Test with NVDA or JAWS
- [ ] All images have alt text
- [ ] Form labels properly associated
- [ ] ARIA labels present where needed
- [ ] Headings properly structured

### Color Contrast
- [ ] Text meets WCAG AA standards
- [ ] Interactive elements have sufficient contrast
- [ ] Error messages are distinguishable

---

## Security Testing

### Authentication
- [ ] Rate limiting works
- [ ] Session expiration works
- [ ] Password reset works
- [ ] CSRF protection works

### Authorization
- [ ] Non-admin cannot access admin routes
- [ ] Users can only access their own data
- [ ] Guest users have limited access

### Input Validation
- [ ] XSS attempts blocked
- [ ] SQL injection attempts blocked
- [ ] File upload restrictions enforced

---

## Test Results Summary

### Date: ___________
### Tester: ___________

| Journey | Status | Notes |
|---------|--------|-------|
| 1. New Customer Registration | ⬜ Pass ⬜ Fail | |
| 2. Returning Customer | ⬜ Pass ⬜ Fail | |
| 3. Guest Checkout | ⬜ Pass ⬜ Fail | |
| 4. Product Reviews | ⬜ Pass ⬜ Fail | |
| 5. Admin Product Management | ⬜ Pass ⬜ Fail | |
| 6. Admin Order Management | ⬜ Pass ⬜ Fail | |
| 7. Admin User Management | ⬜ Pass ⬜ Fail | |
| 8. Profile Management | ⬜ Pass ⬜ Fail | |
| 9. Order Tracking | ⬜ Pass ⬜ Fail | |
| 10. Error Handling | ⬜ Pass ⬜ Fail | |

### Overall Status: ⬜ Ready for Production ⬜ Needs Fixes

### Critical Issues Found:
1. 
2. 
3. 

### Recommendations:
1. 
2. 
3. 

---

**Document Version**: 1.0
**Last Updated**: 2026-02-28
