<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public Order $order;
    public string $previousStatus;

    /**
     * Create a new message instance.
     */
    public function __construct(Order $order, string $previousStatus)
    {
        $this->order = $order;
        $this->previousStatus = $previousStatus;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $statusUpper = strtoupper($this->order->status);
        return new Envelope(
            subject: "Order Update: #{$this->order->order_number} is now {$statusUpper}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $statusUpper = strtoupper($this->order->status);
        return new Content(
            htmlString: "
                <div style='font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;'>
                    <h2 style='color: #0F172A;'>Your Order Status has been updated</h2>
                    <p>Hi {$this->order->customer_name},</p>
                    <p>Your order <strong>#{$this->order->order_number}</strong> status changed from <em>{$this->previousStatus}</em> to <strong style='color: #2563EB;'>{$statusUpper}</strong>.</p>
                    <hr style='border: 1px solid #E2E8F0; margin: 20px 0;' />
                    <p>Total: <strong>\${$this->order->total_amount}</strong></p>
                    <p>You can track your order status in your customer portal anytime.</p>
                </div>
            ",
        );
    }
}

