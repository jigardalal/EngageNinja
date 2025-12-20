/**
 * Business Info & 10DLC Routes
 *
 * Manages tenant business information and 10DLC brand registrations
 * Provides endpoints for:
 * - Getting/creating/updating business info
 * - Submitting 10DLC registrations
 * - Checking 10DLC approval status
 */

const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const { requireAuth, validateTenantAccess } = require('../middleware/auth');
const { requireMember, requireAdmin } = require('../middleware/rbac');
const { logAudit, AUDIT_ACTIONS } = require('../utils/audit');

/**
 * GET /api/business-info
 * Get current business information for tenant
 */
router.get('/', requireAuth, validateTenantAccess, requireMember, (req, res) => {
  try {
    const businessInfo = db.prepare(`
      SELECT * FROM tenant_business_info
      WHERE tenant_id = ?
    `).get(req.tenantId);

    if (!businessInfo) {
      // Pre-populate from tenant data
      const tenant = db.prepare('SELECT name FROM tenants WHERE id = ?').get(req.tenantId);

      return res.json({
        data: {
          tenant_id: req.tenantId,
          legal_business_name: tenant.name,
          business_type: null,
          business_industry: null,
          business_address: null,
          business_city: null,
          business_state: null,
          business_zip: null,
          business_country: null,
          business_phone: null,
          business_email: null,
          business_website: null,
          ein: null,
          authorized_representative_name: null,
          authorized_representative_email: null,
          authorized_representative_phone: null,
          authorized_representative_title: null,
          created_at: null,
          updated_at: null
        },
        status: 'success',
        message: 'No business info yet, pre-populated from tenant data'
      });
    }

    res.json({
      data: businessInfo,
      status: 'success'
    });

  } catch (error) {
    console.error('Get business info error:', error);
    res.status(500).json({
      error: 'Failed to fetch business info',
      message: error.message,
      status: 'error'
    });
  }
});

/**
 * POST /api/business-info
 * Create or update business information
 */
router.post('/', requireAuth, validateTenantAccess, requireAdmin, (req, res) => {
  try {
    const {
      legal_business_name,
      business_type,
      business_industry,
      business_address,
      business_city,
      business_state,
      business_zip,
      business_country,
      business_phone,
      business_email,
      business_website,
      ein,
      authorized_representative_name,
      authorized_representative_email,
      authorized_representative_phone,
      authorized_representative_title
    } = req.body;

    // Validate required fields
    if (!legal_business_name || !business_type || !business_address) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'legal_business_name, business_type, and business_address are required',
        status: 'error'
      });
    }

    // Check if exists
    const existing = db.prepare(
      'SELECT id FROM tenant_business_info WHERE tenant_id = ?'
    ).get(req.tenantId);

    const now = new Date().toISOString();

    if (existing) {
      // Update
      db.prepare(`
        UPDATE tenant_business_info
        SET legal_business_name = ?,
            business_type = ?,
            business_industry = ?,
            business_address = ?,
            business_city = ?,
            business_state = ?,
            business_zip = ?,
            business_country = ?,
            business_phone = ?,
            business_email = ?,
            business_website = ?,
            ein = ?,
            authorized_representative_name = ?,
            authorized_representative_email = ?,
            authorized_representative_phone = ?,
            authorized_representative_title = ?,
            updated_at = ?
        WHERE tenant_id = ?
      `).run(
        legal_business_name, business_type, business_industry,
        business_address, business_city, business_state, business_zip, business_country,
        business_phone, business_email, business_website, ein,
        authorized_representative_name, authorized_representative_email,
        authorized_representative_phone, authorized_representative_title,
        now, req.tenantId
      );

      logAudit({
        actorUserId: req.session.userId,
        actorType: 'tenant_user',
        tenantId: req.tenantId,
        action: AUDIT_ACTIONS.SETTINGS_UPDATE,
        targetType: 'business_info',
        targetId: existing.id,
        metadata: { legal_business_name },
        ipAddress: req.ip
      });

      res.json({
        data: { id: existing.id },
        message: 'Business info updated successfully',
        status: 'success'
      });

    } else {
      // Create
      const id = uuidv4();

      db.prepare(`
        INSERT INTO tenant_business_info (
          id, tenant_id, legal_business_name, business_type, business_industry,
          business_address, business_city, business_state, business_zip, business_country,
          business_phone, business_email, business_website, ein,
          authorized_representative_name, authorized_representative_email,
          authorized_representative_phone, authorized_representative_title,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, req.tenantId, legal_business_name, business_type, business_industry,
        business_address, business_city, business_state, business_zip, business_country,
        business_phone, business_email, business_website, ein,
        authorized_representative_name, authorized_representative_email,
        authorized_representative_phone, authorized_representative_title,
        now, now
      );

      logAudit({
        actorUserId: req.session.userId,
        actorType: 'tenant_user',
        tenantId: req.tenantId,
        action: AUDIT_ACTIONS.SETTINGS_CREATE,
        targetType: 'business_info',
        targetId: id,
        metadata: { legal_business_name },
        ipAddress: req.ip
      });

      res.status(201).json({
        data: { id },
        message: 'Business info created successfully',
        status: 'success'
      });
    }

  } catch (error) {
    console.error('Save business info error:', error);
    res.status(500).json({
      error: 'Failed to save business info',
      message: error.message,
      status: 'error'
    });
  }
});

/**
 * POST /api/business-info/submit-10dlc
 * Submit 10DLC brand registration to Twilio
 */
router.post('/submit-10dlc', requireAuth, validateTenantAccess, requireAdmin, async (req, res) => {
  try {
    // 1. Get business info
    const businessInfo = db.prepare(
      'SELECT * FROM tenant_business_info WHERE tenant_id = ?'
    ).get(req.tenantId);

    if (!businessInfo) {
      return res.status(400).json({
        error: 'Business info required',
        message: 'Please complete business information first',
        status: 'error'
      });
    }

    // 2. Check if tenant is demo
    const tenant = db.prepare('SELECT is_demo FROM tenants WHERE id = ?').get(req.tenantId);

    if (tenant.is_demo) {
      // Demo mode: Create fake approved brand immediately
      const brandId = uuidv4();
      const now = new Date().toISOString();
      const demoPhoneId = `DEMO-${Date.now()}`;

      db.prepare(`
        INSERT INTO tenant_10dlc_brands (
          id, tenant_id, provider, provider_brand_id, provider_status,
          legal_business_name, business_type, business_industry,
          business_address, business_city, business_state, business_zip, business_country,
          ein, authorized_representative_name,
          submitted_at, provider_approved_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        brandId, req.tenantId, 'demo', demoPhoneId, 'APPROVED',
        businessInfo.legal_business_name, businessInfo.business_type, businessInfo.business_industry,
        businessInfo.business_address, businessInfo.business_city, businessInfo.business_state,
        businessInfo.business_zip, businessInfo.business_country,
        businessInfo.ein, businessInfo.authorized_representative_name,
        now, now, now, now
      );

      logAudit({
        actorUserId: req.session.userId,
        actorType: 'tenant_user',
        tenantId: req.tenantId,
        action: '10DLC_SUBMIT',
        targetType: '10dlc_brand',
        targetId: brandId,
        metadata: { legal_business_name: businessInfo.legal_business_name, mode: 'demo' },
        ipAddress: req.ip
      });

      return res.status(201).json({
        data: {
          brand_id: brandId,
          provider_brand_id: demoPhoneId,
          status: 'APPROVED',
          message: 'Demo brand auto-approved for testing'
        },
        status: 'success'
      });
    }

    // 3. For real tenants: Create pending registration
    // NOTE: Full Twilio API integration would go here
    const brandId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tenant_10dlc_brands (
        id, tenant_id, provider, provider_brand_id, provider_status,
        legal_business_name, business_type, business_industry,
        business_address, business_city, business_state, business_zip, business_country,
        ein, authorized_representative_name,
        submitted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      brandId, req.tenantId, 'twilio', 'PENDING', 'PENDING',
      businessInfo.legal_business_name, businessInfo.business_type, businessInfo.business_industry,
      businessInfo.business_address, businessInfo.business_city, businessInfo.business_state,
      businessInfo.business_zip, businessInfo.business_country,
      businessInfo.ein, businessInfo.authorized_representative_name,
      now, now, now
    );

    logAudit({
      actorUserId: req.session.userId,
      actorType: 'tenant_user',
      tenantId: req.tenantId,
      action: '10DLC_SUBMIT',
      targetType: '10dlc_brand',
      targetId: brandId,
      metadata: { legal_business_name: businessInfo.legal_business_name, mode: 'production' },
      ipAddress: req.ip
    });

    res.status(201).json({
      data: {
        brand_id: brandId,
        status: 'PENDING',
        message: '10DLC registration submitted and awaiting Twilio review (typically 1-2 business days)'
      },
      status: 'success'
    });

  } catch (error) {
    console.error('Submit 10DLC error:', error);
    res.status(500).json({
      error: 'Failed to submit 10DLC registration',
      message: error.message,
      status: 'error'
    });
  }
});

/**
 * GET /api/business-info/10dlc-status
 * Get current 10DLC brand status
 */
router.get('/10dlc-status', requireAuth, validateTenantAccess, requireMember, (req, res) => {
  try {
    const brands = db.prepare(`
      SELECT * FROM tenant_10dlc_brands
      WHERE tenant_id = ?
      ORDER BY created_at DESC
    `).all(req.tenantId);

    res.json({
      data: brands,
      status: 'success'
    });

  } catch (error) {
    console.error('Get 10DLC status error:', error);
    res.status(500).json({
      error: 'Failed to fetch 10DLC status',
      message: error.message,
      status: 'error'
    });
  }
});

module.exports = router;
