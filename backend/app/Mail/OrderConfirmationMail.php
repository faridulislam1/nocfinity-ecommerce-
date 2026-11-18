<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->load('items');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Order Confirmation - #{$this->order->order_number}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            htmlString: "
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #0F172A;'>Thank you for your order!</h2>
                    <p>Hi {$this->order->customer_name},</p>
                    <p>We've received your order <strong>#{$this->order->order_number}</strong> and it is now being processed.</p>
                    <hr style='border: 1px solid #E2E8F0; margin: 20px 0;' />
                    <h3>Order Summary</h3>
                    <p>Total Paid: <strong>\${$this->order->total_amount}</strong></p>
                    <p>Shipping to: {$this->order->shipping_address}, {$this->order->shipping_city}, {$this->order->shipping_country}</p>
                    <hr style='border: 1px solid #E2E8F0; margin: 20px 0;' />
                    <p>Thank you for shopping with us!</p>
                </div>
            ",
        );
    }
}

